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
var friendDao = require('../../../dao/friendDao');
var async = require('async');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var formula = require('../../../consts/formula');
var Player = require('../../../domain/entity/player');
var EntityType = require('../../../consts/consts').EntityType;
var consts = require('../../../consts/consts');

var handler = module.exports;

handler.get = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , start = msg.start
        , stop = msg.stop;

    var player = area.getPlayer(session.get('playerId'));

    // 需要验证
    friendDao.getFriends(player, start, stop, function(err, reply) {
        next(null, {
            code: Code.OK,
            result: reply[0]
        });
    });
}

/**
 * 添加好友
 * @param msg
 * @param session
 * @param next
 */
handler.add = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , playerId = msg.playerId;

    var player = area.getPlayer(session.get('playerId'));

    addFriendById(player, playerId, next);
}

function addFriendById(player, playerId, next) {
    friendDao.addFriend(player, playerId, function(err, reply) {
        logger.info(reply);
        if(reply.reply == 1) {
            next(null, {
                code: Code.OK
            });
        } else if(reply.reply == 0) {
            next(null, {
                code: Code.FRIEND.EXIST_FRIEND
            });
        } else {
            next(null, {
                code: Code.FRIEND.NOT_EXIST_PLAYER
            });
        }
    });
}

/**
 * 通过昵称添加
 * @param msg
 * @param session
 * @param next
 */
handler.addByName = function(msg, session, next) {
    var player  = area.getPlayer(session.get('playerId'));
   // var nickName = msg.nickname;
    var serverId = session.get("serverId");
    var self = addFriendById;
    userDao.getPlayerIdByNickname(serverId, msg.nickname, function(err, playerId) {
        logger.info(arguments);
        if(!playerId) {
            next(null,{
                code:Code.FRIEND.NOT_EXIST_PLAYER
            });
            return;
        }
        self(player, playerId, next);
    });
}

/**
 * 删除好友
 * @param msg
 * @param session
 * @param next
 */
handler.remove = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , playerId = msg.playerId;

    var player = area.getPlayer(session.get('playerId'));

    // 需要验证
    friendDao.removeFriend(player, playerId, function(err, reply) {
        next(null, {
            code: Code.OK
        });
    });
}