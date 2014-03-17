/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arena
 */
var arenaService = require('../app/services/arenaService');
var userService = require('../app/services/userService');
var messageService = require('../app/services/messageService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var session = require('../app/http/session');
var region = require('../config/region');
var EntityType = require('../app/consts/consts').EntityType;
var Fight = require('../app/domain/battle/fight');
var FightTeam = require('../app/domain/battle/fightTeam');
var consts = require('../app/consts/consts');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * pk
 * @param req
 * @param res
 */
exports.pk = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , vsPlayerId = msg.vsPlayerId;

    var data = {};
    if(utils.empty(vsPlayerId)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getPlayerById(vsPlayerId, function(err, reply) {
        if(err) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }
        pk(req, res, msg, session, reply);
    });
}

/*function pk(req, res, msg, session, opponent) {
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, character) {
        var owners = {};
        var opponents = {};
        var player;

        var owner_formationData = character.formation;
        var opponent_formationData = opponent.formation;

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
                ownerTeam.addMember(player);
                players.push({
                    "id" : player.id,
                    "maxHP" : player.maxHp,
                    "HP" : player.hp,
                    "anger" : player.anger,
                    "formation" : i
                });
                playersInfo.push(player.strip());
            }
        }

        for(var i = 0 ; i < opponent_formationData.length ; i++) {
            if(opponent_formationData[i] != null && opponent_formationData[i] != 0) {
                if(opponent_formationData[i].playerId.indexOf("P") >= 0) {
                    player = opponent.getPartner(opponent_formationData[i].playerId);
                    player.type = EntityType.OPPONENT_PARTNER;
                    player.formationId = i;
                    opponents[i] = player;
                } else {
                    player = opponent;
                    player.formationId = i;
                    opponents[i] = player;
                }
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

        var fight = new Fight({
            mainPlayer: character,
            owner_formation: owner_formationData,
            monster_formation: opponent_formationData,
            owners: owners,
            monsters: opponents,
            ownerTeam: ownerTeam,
            monsterTeam: monsterTeam
        });
        var data = {};
        fight.pk(function(err, eventResult) {
            var battle = eventResult;
            async.parallel([
                function(callback) {
                    character.updateTaskRecord(consts.TaskGoalType.PVP, {
                        itemId: eventResult.battleResult.isWin == true ? 1 : 0
                    });
                    callback(null, 1);
                },
                function(callback) {
                    eventResult.players = players;
                    eventResult.enemies = enemies;
                    battleService.savePlayerPKData(character, playersInfo, enemiesInfo, eventResult, function(err, battleId) {
                        var date = new Date();
                        var content = "你挑战" + opponent.nickname + "，";
                        if(eventResult.battleResult.isWin == true) {
                            content += "你战胜了，排名上升";
                        } else {
                            content += "你战败了，排名不变";
                        }

                        var owner_battleReport = {
                            player: players,
                            playerId: character.id,
                            opponent: enemies,
                            opponentId: opponent.id,
                            content: content,
                            battleId: battleId,
                            date: date.getTime()
                        };

                        content = character.nickname + "挑战你，";
                        if(eventResult.battleResult.isWin == true) {
                            content += "你战败了，排名下降";
                        } else {
                            content += "你战胜了，排名不变";
                        }

                        var opponent_battleReport = {
                            player: enemies,
                            playerId: opponent.id,
                            opponent: players,
                            opponentId: character.id,
                            content: content,
                            battleId: battleId,
                            date: date.getTime()
                        }

                        messageService.addBothBattleReport(character, opponent, owner_battleReport, opponent_battleReport, function(err, reply) {
                            callback(null, 1);
                        });
                    });
                }
            ],
                function(err, results) {
                    if(eventResult.battleResult.isWin == true) {
                        async.parallel([
                            function(callback) {
                                taskService.updateTask(character, character.curTasksEntity.strip(), callback);
                            }
                        ], function(err, reply) {
                            arenaService.exchange(character, opponent, function(err, reply) {
                                battle.players = players;
                                battle.enemies = enemies;
                                data = {
                                    code: Code.OK,
                                    rank: reply,
                                    battle: battle
                                };
                                utils.send(msg, res, data);
                            });
                        });
                    } else {
                        battle.players = players;
                        battle.enemies = enemies;
                        data = {
                            code: Code.OK,
                            rank: 0,
                            battle: battle
                        };
                        utils.send(msg, res, data);
                    }
                });
        });
    });
}*/

/**
 * 加入竞技场
 * @param req
 * @param res
 */
exports.add = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        arenaService.getRank(player, function(err, reply) {
            if(err) {
                data = {
                    code:500
                };
                utils.send(msg, res, data);
            }
            if(reply == null) {
                arenaService.add(player,function(err,reply) {
                    data = {
                        code: Code.OK,
                        rank: reply
                    };
                    utils.send(msg, res, data);
                });
            } else {
                data = {
                    code: Code.OK,
                    rank: reply + 1
                };
                utils.send(msg, res, data);
            }
        });
    });
}

/**
 * 获得对手
 * @param req
 * @param res
 */
exports.getOpponents = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        arenaService.getOpponents(player, function(err, result) {
            if( result == null ) {
                utils.send(msg, res,{
                    code: Code.FAIL
                });
                return;
            } else {
                utils.send(msg, res,{
                    code: Code.OK,
                    Opponents: result
                });
            }
        });
    });
}

/**
 * 获得排名
 * @param req
 * @param res
 */
exports.getRank = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        arenaService.getRank(player, function(err, reply) {
            if(err) {
                utils.send(msg, res, {
                    code:500
                });
            }
            if(reply == null) {
                arenaService.add(player,function(err,reply) {
                    utils.send(msg, res, {
                        code:Code.OK,
                        rank: reply
                    });
                });
            } else {
                utils.send(msg, res, {
                    code: Code.OK,
                    rank: reply + 1
                });
            }
        });
    });
}

/**
 * 进入竞技场
 * @param req
 * @param res
 */
exports.enterArena = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        messageService.getBattleReport(serverId, registerType, loginName, characterId, function(err, battleReports) {
            arenaService.getOpponents(player, function(err, result) {
                if( result == null ) {
                    utils.send(msg, res,{
                        code: Code.FAIL
                    });
                    return;
                } else {
                    utils.send(msg, res, {
                        code: Code.OK,
                        Opponents: result,
                        battleReports: battleReports
                    });
                }
            });
        });
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.getPKData = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var battleId = msg.battleId;

    var data = {};
    battleService.getBattleData(serverId, battleId, function(err, reply) {
        data = {
            code: Code.OK,
            battleData: reply
        };
        utils.send(msg, res, data);
    })
}