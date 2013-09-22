/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: gmDao
 */
var Task = require('../domain/task');
var consts = require('../consts/consts');
var taskApi = require('../utils/dataApi').task;
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var gmDao = module.exports;

/**
 *
 * @param player
 * @param arguments
 * @param next
 */
gmDao.resetTask = function(session, arguments, next) {
    var type = arguments[0];
    var taskId = arguments[1] || "";
    if(typeof type == "string") {

    } else {
        type = consts.correspondingCurTaskType[type];
    }
    var playerId = session['playerId'];
}

gmDao.updateMoney = function(session, arguments, next) {
    var money = arguments[0];
}

gmDao.updateExp = function(session, arguments, next) {
    var exp = arguments[0];
}