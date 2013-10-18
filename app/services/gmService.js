/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var gmDao = require('../dao/gmDao');

var gmService = module.exports;

/**
 * 重置任务
 */
gmService.resetTask = function(type, taskId, cb) {
    gmDao.resetTask(type, taskId, cb);
}

/**
 * 更新金币
 */
gmService.updateMoney = function(money, cb) {
    gmDao.updateMoney(money, cb);
}

/**
 * 更新经验
 */
gmService.updateExp = function(exp, cb) {
    gmDao.updateExp(exp, cb);
}