/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-06
 * Description: friendDao
 */
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var userDao = require('./userDao');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var friendDao = module.exports;

/**
 * 添加好友
 */
friendDao.addFriend = function(player, f_playerId, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getFriendKey(player.sid, player.registerType, player.loginName, characterId);
    var array = [];
    array.push(["zadd", key, 1, f_playerId]);

    //dbUtil.executeCommand(redis, redisConfig, array, {playerId: f_playerId}, cb);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.exists(f_playerId, function(err, reply) {
                if(reply == 1) {
                    client.multi(array).exec(function (err, replies) {
                        redis.release(client);
                        utils.invokeCallback(cb, null, {
                            reply: replies
                        });
                    });
                } else {
                    utils.invokeCallback(cb, null, {
                        reply: -1
                    });
                }
            });
        }).exec(function (err, replies) {

            });
    });
};

/**
 * 删除好友
 */
friendDao.removeFriend = function(player, f_playerId, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getFriendKey(player.sid, player.registerType, player.loginName, characterId);
    var array = [];
    array.push(["zrem", key, f_playerId]);

    dbUtil.executeCommand(redis, redisConfig, array, {playerId: f_playerId}, cb);
};

/**
 * 获得好友列表
 */
friendDao.getFriends = function(player, start, stop, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getFriendKey(player.sid, player.registerType, player.loginName, characterId);
    var array = [];
    array.push(["zrange", key, start, stop]);

    dbUtil.getObject(redis, redisConfig, array, cb);
};