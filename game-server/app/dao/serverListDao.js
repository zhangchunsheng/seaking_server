/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-05
 * Description: serverListDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var serverList = require('../domain/serverList');
var utils = require('../util/utils');
var redis = require('./redis/redis');

var serverListDao = module.exports;

/**
 * 获得服务器列表
 *
 * @param app
 * @param playerId
 * @param next
 */
serverListDao.getServerLists = function(app, playerId, next) {
    var redisConfig = app.get('redis');
    redis.command(function(client) {
        client.multi().select(redisConfig.database.UC_USER_REDIS_DB, function() {

        }).lrange("sk_serverList", 0, -1, function(err, replies) {
                var serverList = [];
                var key = "";
                var obj = {};
                for(var i = 0 ; i < replies.length ; i++) {
                    key = replies[i];
                    client.hgetall(key, function(err, result) {
                        serverList.push(result);
                        if(serverList.length == replies.length) {
                            next(err, serverList);
                        }
                    });
                }
            })
            .exec(function (err, replies) {
                console.log(replies);
            });
    });
};