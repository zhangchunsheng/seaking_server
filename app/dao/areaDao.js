/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: areaDao
 */
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var areaDao = module.exports;

areaDao.addPlayer = function(playerId) {

}

areaDao.getAreaInfo = function(player, cb) {
    redis.command(function(client) {
        client.multi()
            .select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
                var key = player.currentScene;
                client.hkeys(key, function(err, players) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, players);
                });
            })
            .exec(function(err, reply) {

            });
    });
}

areaDao.getAreaPlayers = function(sceneId, cb) {
    redis.command(function(client) {
        client.multi()
            .select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
                var key = sceneId;
                client.hgetall(key, function(err, players) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, players);
                });
            })
            .exec(function(err, reply) {

            });
    });
}

areaDao.addEntity = function(player, cb) {
    redis.command(function(client) {
        client.multi()
            .select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
                var key = player.currentScene;

                var date = new Date();
                var value = {
                    name: player.nickname,
                    time: date.getTime()
                };
                client.hset(key, player.id, JSON.stringify(value), function(err, reply) {
                    utils.invokeCallback(cb, null, reply);
                });
            })
            .exec(function(err, reply) {

            });
    });
}

areaDao.removePlayer = function(player, cb) {
    redis.command(function(client) {
        client.multi()
            .select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
                var key = player.currentScene;

                client.hdel(key, player.id, function(err, reply) {
                    utils.invokeCallback(cb, null, reply);
                });
            })
            .exec(function(err, reply) {

            });
    });
}

areaDao.removeAndUpdatePlayer = function(areaId, player, cb) {
    redis.command(function(client) {
        client.multi()
            .select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
                var key = player.currentScene;

                var array = [];
                array.push(["hdel", areaId, player.id]);
                var key = player.currentScene;

                var date = new Date();
                var value = {
                    name: player.nickname,
                    time: date.getTime()
                };
                array.push(["hset", key, player.id, JSON.stringify(value)]);

                var characterId = utils.getRealCharacterId(player.id);
                key = "S" + player.serverId + "_T" + player.registerType + "_" + player.loginName + "_C" + characterId;
                array.push(["hset", key, "currentScene", player.currentScene]);

                client.multi(array)
                    .exec(function(err, reply) {
                        utils.invokeCallback(cb, null, reply);
                    });
            })
            .exec(function(err, reply) {

            });
    });
}