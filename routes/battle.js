/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: battle
 */
var battleService = require('../app/services/battleService');
var userService = require('../app/services/userService');
var playerService = require('../app/services/playerService');
var battleService = require('../app/services/battleService');
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var EntityType = require('../app/consts/consts').EntityType;
var Monster = require('../app/domain/entity/monster');
var dataApi = require('../app/utils/dataApi');
var Fight = require('../app/domain/battle/fight');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 战斗
 * @param req
 * @param res
 */
exports.battle = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , eid = msg.eid;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, character) {
        var induId = character.currentIndu.induId;

        var data = {};
        if(induId == 0) {
            data = {
                code: Code.INDU.NOT_AT_INDU
            };
            utils.send(msg, res, data);
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
            data = {
                code: Code.INDU.NO_EVENT_EXIST
            };
            utils.send(msg, res, data);
            return;
        }

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

        fight.fight(function(err, reply) {
            async.parallel([
                function(callback) {
                    playerService.updatePlayerHP(character, fight.owner_players, function(err, reply) {
                        callback(err, reply);
                    });
                },
                function(callback) {
                    battleService.savePlayerBattleData(character, fight.owner_players, fight.monsters, reply, function(err, reply) {

                    });
                    callback(null, 1);
                }
            ],
                function(err, results) {
                    var playerInfo = results[0];
                    if(reply.battleResult.isWin == true) {
                        async.parallel([
                            function(callback) {
                                userService.updatePlayerInduInfo(character, eid, callback);
                            },
                            function(callback) {
                                userService.updatePlayerAttribute(character, callback);
                            },
                            function(callback) {
                                packageService.update(character.packageEntity.strip(), callback);
                            },
                            function(callback) {
                                equipmentsService.update(character.equipmentsEntity.strip(), callback);
                            },
                            function(callback) {
                                taskService.updateTask(character, character.curTasksEntity.strip(), callback);
                            }
                        ], function(err, reply) {
                            var result = {
                                induData: {
                                    eid: eid,
                                    died: false
                                },
                                playerInfo: playerInfo,
                                eventResult: reply
                            }
                            utils.send(msg, res, result);
                        });
                    } else {
                        var result = {
                            induData: {
                                eid: eid,
                                died: false
                            },
                            eventResult: reply
                        }
                        utils.send(msg, res, result);
                    }
                });
        });
    });
}