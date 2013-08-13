/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: dbUtil
 */
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../config/redis');
var dbUtil = module.exports;

/**
 * select db
 * @param redis
 */
dbUtil.selectDb = function(dbIndex, cb) {
    redis.command(function(client) {
        client.select(dbIndex, function() {
            cb(client);
        });
    });
}

/**
 *
 * @param redis
 */
dbUtil.closeDb = function() {
    redis.shutdown();
}