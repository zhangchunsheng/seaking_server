/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-24
 * Description: battleDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var packageDao = require('./packageDao');
var fightskillDao = require('./fightskillDao');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var redis  = require("redis");

var battleDao = module.exports;

/**
 * 获得characterId
 */
battleDao.getBattleId = function(client, callback) {
    var key = "battleId";
    client.incr(key, function(err, reply) {
        callback.call(this, err, reply);
    });
}

/**
 * 保存玩家战斗数据
 */
battleDao.savePlayerBattleData = function(player, owners, monsters, battleData, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            battleDao.getBattleId(client, function(err, battleId) {
                var array = [];
                var key = "S" + player.sid + "_Battle";
                var _owners = [];
                var _monsters = [];
                for(var i = 0 ; i < owners.length ; i++) {
                    _owners.push(owners[i].strip());
                }
                for(var i = 0 ; i < monsters.length ; i++) {
                    _monsters.push(monsters[i].strip());
                }
                var data = {
                    owners: _owners,
                    monsters: _monsters,
                    battleData: battleData
                };
                array.push(["hset", key, battleId, JSON.stringify(data)]);
                var characterId = utils.getRealCharacterId(player.id);
                var key = dbUtil.getBattleKey(player.sid, player.registerType, player.loginName, characterId)
                array.push(["lpush", key, battleId]);
                client.multi(array).exec(function(err, replies) {
                    redis.release(client);
                });
            });
        }).exec(function (err, replies) {

        });
    });
}