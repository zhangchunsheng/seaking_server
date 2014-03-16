/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: indu
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
var FightV2 = require('../app/domain/battle/fightV2');
var FightTeam = require('../app/domain/battle/fightTeam');
var indu = require('../app/domain/area/indu');
var async = require('async');

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

        if(eid.indexOf("MG") >= 0) {
            //var owner_formationData = character.formation;//[{"playerId":"S1C10"},{"playerId":"S1C10P1"},{"playerId":"S1C10P2"},null,null,null,null]// array index - 阵型位置 array value - character id
            var owner_formationData = character.formationEntity.getInfo();
            var induMonstergroup = dataApi.induMonstergroup.findById(eid);
            var monster_formationData = induMonstergroup.formation;//["M10101","M10102",0,"M10103",0,0,0];// 0,1,2,3,4,5,6

            var owners = {};
            var monsters = {};
            var player;

            var players = [];
            var enemies = [];
            var playersInfo = [];
            var enemiesInfo = [];

            var ownerTeam = new FightTeam({
                type: consts.teamType.PLAYER_TEAM
            });
            var monsterTeam = new FightTeam({
                type: consts.teamType.MONSTER_TEAM
            });

            // 阵型中角色数据
            // get player info from db
            /* { formation:
                { '1': { playerId: 'S1C1' },
                '2': { playerId: 'S1C1P4' },
                '3': null },
                tactical: { id: 'F102', level: 4 }
            }*/
            var owner_formation = owner_formationData.formation.formation;
            for(var i in owner_formation) {
                if(owner_formation[i] != null && owner_formation[i] != 0) {
                    if(owner_formation[i].playerId.indexOf("P") >= 0) {
                        player = character.getPartner(owner_formation[i].playerId);
                        player.formationId = i - 1;
                        owners[i - 1] = player;
                    } else {
                        player = character;
                        player.formationId = i - 1;
                        owners[i - 1] = player;
                    }
                    ownerTeam.addMember(player);
                    players.push({
                        "id" : player.id,
                        "maxHP" : player.maxHp,
                        "HP" : player.hp,
                        "anger" : player.anger,
                        "formation" : i - 1
                    });
                    playersInfo.push(player.strip());
                }
            }
            // get monster info from file config
            var monster = {};
            for(var i = 0 ; i < monster_formationData.length ; i++) {
                if(monster_formationData[i] != null && monster_formationData[i] != 0) {
                    player = new Monster(FightV2.createMonster({
                        id: monster_formationData[i],
                        formationId: i,
                        type: EntityType.MONSTER
                    }));
                    monsters[i] = player;

                    monsterTeam.addMember(player);

                    enemies.push({
                        "id" : player.id,
                        "maxHP" : player.maxHp,
                        "HP" : player.hp,
                        "anger" : player.anger,
                        "formation" : i
                    });
                    enemiesInfo.push(player.strip());
                }
            }

            var fight = new FightV2({
                mainPlayer: character,
                owner_formation: owner_formationData,
                monster_formation: monster_formationData,
                owners: owners,
                monsters: monsters,
                ownerTeam: ownerTeam,
                monsterTeam: monsterTeam
            });

            var result = fight.fight(function(err, eventResult) {
                async.parallel([
                    function(callback) {
                        playerService.updatePlayerHP(character, fight.owner_players, function(err, reply) {
                            callback(err, reply);
                        });
                    },
                    function(callback) {
                        eventResult.players = players;
                        eventResult.enemies = enemies;
                        battleService.savePlayerBattleData(character, playersInfo, enemiesInfo, eventResult, function(err, reply) {

                        });
                        callback(null, 1);
                    }
                ],
                    function(err, results) {
                        var playerInfo = results[0];
                        if(eventResult.battleResult.isWin == true) {
                            character.updateTaskRecord(consts.TaskGoalType.KILL_MONSTER, fight.monsters);

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
                                var currentIndu = reply[0];
                                character.updateTaskRecord(consts.TaskGoalType.PASS_INDU, currentIndu);
                                var result = {
                                    induData: {
                                        eid: eid,
                                        died: true
                                    },
                                    playerInfo: playerInfo,
                                    eventResult: eventResult
                                }
                                utils.additionalData(result, character);
                                utils.send(msg, res, result);
                            });
                        } else {
                            var result = {
                                induData: {
                                    eid: eid,
                                    died: false
                                },
                                eventResult: eventResult
                            }
                            if(character.hasUpgrade) {
                                result.hasUpgrade = true;
                                result.playerInfo = character.getUpgradeInfo();
                            }
                            utils.send(msg, res, result);
                        }
                    });
            });
        } else {
            indu.triggerEvent(character, eid, function(err, data) {
                userService.updatePlayerInduInfo(character, eid, function(err, currentIndu) {
                    var result = {
                        induData: {
                            eid: eid,
                            died: true
                        },
                        eventResult: data
                    }
                    utils.send(msg, res, result);
                });
            });
        }
    });
}