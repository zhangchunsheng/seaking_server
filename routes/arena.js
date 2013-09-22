/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arena
 */
var arenaService = require('../app/services/arenaService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

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
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , vsPlayerId = msg.vsPlayerId;

    var opponent = area.getPlayer(vsPlayerId);
    if(opponent == null) {
        userDao.getPlayerById(vsPlayerId, function(err, reply) {
            pk(msg, session, next, reply);
        });
    } else {
        pk(msg, session, next, opponent);
    }
}

function pk(msg, session, next, opponent) {
    var character = area.getPlayer(session.get('playerId'));

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
    fight.pk(function(err, reply) {
        var battle = reply;
        player.updateTaskRecord(consts.TaskGoalType.PVP, {
            itemId: reply.battleResult.isWin == true ? 1 : 0
        });
        if(reply.battleResult.isWin == true) {
            arenaDao.exchange(character, opponent, function(err, reply) {
                next(null, {
                    code: Code.OK,
                    rank: reply,
                    battle: battle
                });
            });
        }
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
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName");

    var player = area.getPlayer(session.get('playerId'));

    arenaDao.add(player, function(err, reply) {
        next(null, {
            code: Code.OK,
            rank: reply
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

    var player = area.getPlayer(session.get('playerId'));
    arenaDao.getOpponents(player, function(err, result) {
        if( result == null ) {
            next(null,{
                code: Code.FAIL
            });
            return;
        } else {
            next(null,{
                code: Code.OK,
                Opponents: result
            });
        }
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
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName");

    var player = area.getPlayer(session.get('playerId'));

    arenaDao.getRank(player, function(err, reply) {
        next(null, {
            code: Code.OK,
            rank: reply + 1
        });
    });
}