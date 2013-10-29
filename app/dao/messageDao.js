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

messageDao.getMessage = function(cb) {

}

messageDao.pushMessage = function(cb) {
    var key = "S" + player.sid + "_ARENA";
    var array = [];


    //dbUtil.executeCommand(redis, redisConfig, array, {playerId: f_playerId}, cb);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).zcard(key, function(err, reply) {
                var score = ++reply;
                array.push(["zadd", key, score, player.id]);
                client.multi(array).exec(function (err, replies) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, score);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.removeMessage = function(cb) {

}