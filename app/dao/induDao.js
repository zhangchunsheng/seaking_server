/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-13
 * Description: induDao
 */
var dataApi = require('../utils/dataApi');
var consts = require('../consts/consts');
var async = require('async');
var utils = require('../utils/utils');
var consts = require('../consts/consts');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var induDao = module.exports;

induDao.getInduInfo = function(serverId, registerType, loginName, induId, cb) {
    var induInfo = dataApi.instancedungeon.findById(induId);
    utils.invokeCallback(cb, null, induInfo);
}

/**
 * 获得怪物组信息
 * @param mgid
 * @param cb
 */
induDao.getInduMonstergroup = function(mgid, cb) {
    var induMonstergroup = dataApi.induMonstergroup.findById(mgid);
    utils.invokeCallback(cb, null, induMonstergroup);
}

/**
 *
 * @param redis
 * @param client
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 * @param induId
 * @param currentIndu
 * @param isFinished
 */
induDao.logData = function(redis, client, serverId, registerType, loginName, characterId, induId, currentIndu, isFinished) {
    var date = new Date();
    var induLog = {
        registerType: registerType,
        loginName: loginName,
        characterId: characterId,
        induId: induId,
        induData: currentIndu.induData,
        date: date.getTime(),
        enterDate: currentIndu.enterDate,
        finishDate: date.getTime(),
        isFinished: isFinished
    };
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    key = key + "_" + induId;
    client.lpush(key, JSON.stringify(induLog), function(err, reply) {
        redis.release(client);
    });
}

induDao.getLogData = function(serverId, registerType, loginName, characterId, induId, currentIndu, isFinished) {
    var date = new Date();
    var induLog = {
        serverId: serverId,
        registerType: registerType,
        loginName: loginName,
        characterId: characterId,
        induId: induId,
        induData: currentIndu.induData,
        date: date.getTime(),
        enterDate: currentIndu.enterDate,
        finishDate: date.getTime(),
        isFinished: isFinished
    };
    return induLog;
}