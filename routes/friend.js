/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: friend
 */
var friendService = require('../app/services/friendService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var friendDao = require('../app/dao/friendDao');
var userDao = require('../app/dao/userDao');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 获得好友
 * @param req
 * @param res
 */
exports.get = function(req, res) {
    var msg = req.query;
    var session = req.session;

    
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var start = msg.start || 0 ;
    var stop = msg.stop || -1;
    // 需要验证
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        friendDao.getFriends(player, start, stop, function(err, reply) {
            utils.send(msg, res, {
                code: Code.OK,
                result: reply[0]
            });
        });
    });
}

/**
 * 添加好友
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
    var friendId = msg.friendId;

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        addFriendById(player, friendId, msg, res);
    });
}

function addFriendById(player, playerId, msg, res) {
    friendDao.addFriend(player, playerId, function(err, reply) {
        if(reply.reply == 1) {
            utils.send(msg, res, {
                code: Code.OK   
                
            });
        } else if(reply.reply == 0) {
            utils.send(msg, res, {
                 code: Code.FRIEND.EXIST_FRIEND 
            });
        } else {
            utils.send(msg, res, {
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
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
    // var nickName = msg.nickname;
   // var self = addFriendById;
        userDao.getPlayerIdByNickname(serverId, msg.nickname, function(err, playerId) {
            if(!playerId) {
                utils.send(msg, res, {
                    code:Code.FRIEND.NOT_EXIST_PLAYER
                });
                return;
            }
            addFriendById(player, playerId, msg, res);
        });
    });
}

/**
 * 删除好友
 * @param req
 * @param res
 */
exports.remove = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var friendId = msg.friendId; 
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {

    // 需要验证
        friendDao.removeFriend(player, friendId, function(err, reply) {
            utils.send(msg, res, {
                code: Code.OK
            });
        });
    });
}