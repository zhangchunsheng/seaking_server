/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: redis
 */
var redisclient = module.exports;

var _pool = null;

var G = {};

G.init = function(app) {
    if(!_pool) {
        _pool = require('./dao-pool').createRedisPool(app);
    }
}

G.command = function(func) {
    _pool.acquire(function(err, client) {
        if(!!err) {
            console.error('[redisCommandErr]' + err.stack);
            return;
        }
        if(typeof func == "function") {
            func.call(null, client);
        } else {
            _pool.release(client);
        }
    });
}

G.shutdown = function() {
    _pool.destroyAllNow()
}

/**
 * init database
 * @param app
 */
redisclient.init = function(app) {
    if(!!_pool) {
        return redisclient;
    } else {
        G.init(app);
        redisclient.command = G.command;
        return redisclient;
    }
}

/**
 * shutdown database
 * @param app
 */
redisclient.shutdown = function(app) {
    G.shutdown(app);
}