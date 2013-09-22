/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: friend
 */
var authService = require('../app/services/authService');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 获得好友
 * @param req
 * @param res
 */
exports.get = function(req, res) {
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
 * @param req
 * @param res
 */
exports.add = function(req, res) {
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
 * 通过昵称添加好友
 * @param req
 * @param res
 */
exports.addByName = function(req, res) {
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
 * @param req
 * @param res
 */
exports.remove = function(req, res) {
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