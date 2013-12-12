/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: redisDao
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

var redisDao = module.exports;

/**
 * getData
 * @param array
 * @param cb
 */
redisDao.getData = function(array, cb) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            if(err) {
                redis.release(client);
                utils.invokeCallback(cb, err, null);
                return;
            }
            client.multi(array).exec(function(err, reply) {
                redis.release(client);
                utils.invokeCallback(cb, err, reply);
            });
        }).exec(function(err, replies) {

            });
    });
}

/**
 * setData
 * @param array
 * @param cb
 */
redisDao.setData = function(array, cb) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            if(err) {
                redis.release(client);
                utils.invokeCallback(cb, err, null);
                return;
            }
            client.multi(array).exec(function(err, reply) {
                redis.release(client);
                utils.invokeCallback(cb, err, reply);
            });
        }).exec(function(err, replies) {

            });
    });
}