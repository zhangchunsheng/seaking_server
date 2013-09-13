/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-29
 * Description: dao-pool
 */
var _poolModule = require('generic-pool');

/**
 * Create redis connection pool.
 * @returns {Object}
 */
var createRedisPool = function(app) {
    return _poolModule.Pool({
        name: 'redis',
        create: function(callback) {
            var redis = require('redis');
            var client = redis.createClient(6379, "192.168.1.22");
            callback(null, client);
        },
        destroy: function(client) {
            client.quit();
        },
        max: 100,
        idleTimeoutMillis: 30000,
        log: false
    });
}

exports.createRedisPool = createRedisPool;