/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: redisService
 */
var redisDao = require('../dao/redisDao');

var redisService = module.exports;

/**
 * getData
 * @param array
 * @param cb
 */
redisService.getData = function(array, cb) {
    redisDao.getData(array, cb);
}

/**
 * setData
 * @param array
 * @param cb
 */
redisService.setData = function(array, cb) {
    redisDao.setData(array, cb);
}