/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: indu
 */
var induService = require('../app/services/induService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 触发副本事件
 * @param req
 * @param res
 */
exports.triggerEvent = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , eid = msg.eid;// MG开头则为战斗 E开头直接触发事件

    var character = area.getPlayer(session.get('playerId'));
    var induId = character.currentIndu.induId;

    if(induId == 0) {
        next(null, {
            code: Code.INDU.NOT_AT_INDU
        });
        return;
    }

    var induData = character.currentIndu.induData;
    var flag = false;
    for(var i = 0 ; i < induData.length ; i++) {
        if(induData[i] == null)
            continue;
        if(induData[i].eventId == eid && !induData[i].died) {
            flag = true;
            break;
        }
    }
    if(!flag) {
        next(null, {
            code: Code.INDU.NO_EVENT_EXIST
        });
        return;
    }

    if(eid.indexOf("MG") >= 0) {
        var owner_formationData = character.formation;//[{"playerId":"S1C10"},{"playerId":"S1C10P1"},{"playerId":"S1C10P2"},null,null,null,null]// array index - 阵型位置 array value - character id
        var induMonstergroup = dataApi.induMonstergroup.findById(eid);
        var monster_formationData = induMonstergroup.formation;//["M10101","M10102",0,"M10103",0,0,0];// 0,1,2,3,4,5,6

        var owners = {};
        var monsters = {};
        var player;

        // 阵型中角色数据
        // get player info from db
        for(var i = 0 ; i < owner_formationData.length ; i++) {
            if(owner_formationData[i] != null && owner_formationData[i] != 0) {
                if(owner_formationData[i].playerId.indexOf("P") >= 0) {
                    player = character.getPartner(owner_formationData[i].playerId);
                    player.formationId = i;
                    owners[i] = player;
                } else {
                    player = character;
                    player.formationId = i;
                    owners[i] = player;
                }
            }
        }
        // get monster info from file config
        var monster = {};
        for(var i = 0 ; i < monster_formationData.length ; i++) {
            if(monster_formationData[i] != null && monster_formationData[i] != 0) {
                player = new Monster(Fight.createMonster({
                    id: monster_formationData[i],
                    formationId: i,
                    type: EntityType.MONSTER
                }));
                monsters[i] = player;
            }
        }

        var fight = new Fight({
            mainPlayer: character,
            owner_formation: owner_formationData,
            monster_formation: monster_formationData,
            owners: owners,
            monsters: monsters
        });

        var result = fight.fight(function(err, reply) {
            async.parallel([
                function(callback) {
                    playerDao.updatePlayerHP(character, fight.owner_players, function(err, reply) {
                        callback(err, reply);
                    });
                },
                function(callback) {
                    battleDao.savePlayerBattleData(character, fight.owner_players, fight.monsters, reply, function(err, reply) {

                    });
                    callback(null, 1);
                }
            ],
                function(err, results) {
                    var playerInfo = results[0];
                    if(reply.battleResult.isWin == true) {
                        userDao.updatePlayerInduInfo(character, eid, function(err, data) {
                            var result = {
                                induData: {
                                    eid: eid,
                                    died: true
                                },
                                playerInfo: playerInfo,
                                eventResult: reply
                            }
                            next(null, result);
                        });
                        character.updateTaskRecord(consts.TaskGoalType.KILL_MONSTER, fight.monsters);
                        // update task
                    } else {
                        var result = {
                            induData: {
                                eid: eid,
                                died: false
                            },
                            eventResult: reply
                        }
                        next(null, result);
                    }
                });
        });
    } else {
        indu.triggerEvent(character, eid, function(err, data) {
            userDao.updatePlayerInduInfo(character, eid, function(err, currentIndu) {
                var result = {
                    induData: {
                        eid: eid,
                        died: true
                    },
                    eventResult: data
                }
                next(null, data);
            });
        });
    }
}