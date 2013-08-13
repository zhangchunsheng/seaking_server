/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-29
 * Description: dao-pool
 */
var _poolModule = require('generic-pool')
    , redisConfig = require('../../../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var createRedisPool = function() {
    return _poolModule.Pool({
        name: 'redis',
        create: function(callback) {
            var redis = require('redis');
            var client = redis.createClient(redisConfig.port, redisConfig.host);
            callback(null, client);
        },
        destroy: function(client) {
            client.quit();
        },
        max: 1000,
        idleTimeoutMillis: 30000,
        log: false
    });
}

exports.createRedisPool = createRedisPool;