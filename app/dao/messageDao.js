/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: messageDao
 */
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var messageDao = module.exports;

messageDao.addMessage = function(serverId, registerType, loginName, message, cb) {

}

messageDao.getMessage = function(serverId, registerType, loginName, cb) {

}

messageDao.pushMessage = function(serverId, registerType, loginName, message, cb) {

}

messageDao.removeMessage = function(serverId, registerType, loginName, cb) {

}

messageDao.addTipMessage = function(serverId, registerType, loginName, message, cb) {

}

messageDao.getTipMessage = function(serverId, registerType, loginName, cb) {

}

messageDao.removeTipMessage = function(serverId, registerType, loginName, cb) {

}

messageDao.addBattleReport = function(serverId, registerType, loginName, cb) {

}

messageDao.getBattleReport = function(serverId, registerType, loginName, cb) {

}

messageDao.removeBattleReport = function(serverId, registerType, loginName, cb) {

}

messageDao.publishMessage = function(message, cb) {
    var channel = consts.messageChannel.PUSH_MESSAGE;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).publish(channel, message, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(cb, null, reply);
            }).exec(function (err, replies) {

            });
    });
}