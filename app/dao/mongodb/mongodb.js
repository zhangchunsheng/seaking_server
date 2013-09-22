/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-06
 * Description: mongodb
 */
var mongo = require('mongoskin')
    , mongoConfig = require('../.././mongodb');

var mongoclient = module.exports;

var _pool = null;

var G = {};

G.init = function() {
    if(!_pool) {
        _pool = mongo.db(mongoConfig.url, {
            database: mongoConfig.database,
            safe: mongoConfig.safe
        });
        //_pool = require('./dao-pool').createMongoPool();
    }
}

G.command = function(func) {
    if(typeof func == "function") {
        func.call(null, _pool);
    }
    /*_pool.acquire(function(err, client) {
        if(!!err) {
            console.error('[redisCommandErr]' + err.stack);
            return;
        }
        if(typeof func == "function") {
            func.call(null, client);
        } else {
            _pool.release(client);
        }
    });*/
}

G.shutdown = function() {
    _pool.close();
}

/**
 * init database
 */
mongoclient.init = function() {
    if(!!_pool) {
        return mongoclient;
    } else {
        G.init();
        mongoclient.command = G.command;
        return mongoclient;
    }
}

/**
 * shutdown database
 */
mongoclient.shutdown = function() {
    G.shutdown();
}