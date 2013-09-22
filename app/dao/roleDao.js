/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: roleDao
 */
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var packageDao = require('./packageDao');
var induDao = require('./induDao');
var taskDao = require('./taskDao');
var partnerDao = require('./partnerDao');
var playerDao = require('./playerDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var ucenter = require('../lib/ucenter/ucenter');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var userDao = module.exports;

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
userDao.is_exists_nickname = function(serverId, nickname, next) {
    var key = "S" + serverId + "_exist_nickname";
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).sismember(key, nickname, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(next, null, reply);
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
userDao.has_nickname_player = function(serverId, nickname, next) {
    var key = "S" + serverId + "_N" + nickname;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).exists(key, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(next, null, reply);
            })
            .exec(function (err, replies) {

            });
    });
}