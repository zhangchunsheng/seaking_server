/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arena
 */
var arenaService = require('../app/services/arenaService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var session = require('../app/http/session');
var region = require('../config/region');
var EntityType = require('../app/consts/consts').EntityType;
var Fight = require('../app/domain/battle/fight');
var consts = require('../app/consts/consts');
var arenaDao = require('../app/dao/arenaDao');

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

    userService.getPlayerById(vsPlayerId, function(err, reply) {
        pk(req, res, msg, session, reply);
    });
}

function pk(req, res, msg, session, opponent) {
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
            }
        }

        var fight = new Fight({
            mainPlayer: character,
            owner_formation: owner_formationData,
            monster_formation: opponent_formationData,
            owners: owners,
            monsters: opponents
        });
        var data = {};
        fight.pk(function(err, reply) {
            var battle = reply;
            player.updateTaskRecord(consts.TaskGoalType.PVP, {
                itemId: reply.battleResult.isWin == true ? 1 : 0
            });
            if(reply.battleResult.isWin == true) {
                arenaService.exchange(character, opponent, function(err, reply) {
                    data = {
                        code: Code.OK,
                        rank: reply,
                        battle: battle
                    };
                    utils.send(msg, res, data);
                });
            }
        });
    });
}

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
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        arenaDao.add(player, function(err, reply) {
            next(null, {
                code: Code.OK,
                rank: reply
            });
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
        arenaDao.getOpponents(player, function(err, result) {
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
        arenaDao.getRank(player, function(err, reply) {
            if(err){console.log(err.message);utils.send(msg,res,{code:500});}
            if(reply == null) {
                arenaDao.add(player,function(err,reply){
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