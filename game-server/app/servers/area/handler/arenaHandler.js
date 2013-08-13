/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-31
 * Description: arenaHandler
 */
var area = require('../../../domain/area/area');
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var playerDao = require('../../../dao/playerDao');
var arenaDao = require('../../../dao/arenaDao');
var async = require('async');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var formula = require('../../../consts/formula');
var Player = require('../../../domain/entity/player');
var EntityType = require('../../../consts/consts').EntityType;
var Fight = require('../../../domain/battle/fight');
var consts = require('../../../consts/consts');

var handler = module.exports;

handler.pk = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , vsPlayerId = msg.vsPlayerId;

    var opponent = area.getPlayer(vsPlayerId);
    logger.info(opponent);
    if(opponent == null) {
        userDao.getPlayerById(vsPlayerId, function(err, reply) {
            logger.info(reply);
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

handler.add = function(msg, session, next) {
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

handler.getRank = function(msg, session, next) {
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

handler.getOpponents = function(msg, session, next) {
     var player = area.getPlayer(session.get('playerId'));
     arenaDao.getOpponents(player,function(result){
            if(result.length == 0){
                next(null,{});
                return;
            }else{
                next(null,{code:Code.OK,result:result});
            }
     });
}