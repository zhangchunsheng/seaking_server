/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-24
 * Description: battleDao
 */
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var packageDao = require('./packageDao');
var skillDao = require('./skillDao');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var ucenter = require('../lib/ucenter/ucenter');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

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
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            battleDao.getBattleId(client, function(err, battleId) {
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

                // battleDao.saveLogData(redis, client, player, battleId, data);
                var logData = battleDao.getLogData(player, battleId, data);
                ucenter.saveBattleLog(logData);
            });
        }).exec(function (err, replies) {

        });
    });
}

battleDao.saveLogData = function(redis, client, player, battleId, data) {
    var array = [];
    array.push(["hset", key, battleId, JSON.stringify(data)]);
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getBattleKey(player.sid, player.registerType, player.loginName, characterId)
    array.push(["lpush", key, battleId]);
    client.multi(array).exec(function(err, replies) {
        redis.release(client);
    });
}

battleDao.getLogData = function(player, battleId, battleData) {
    var date = new Date();
    var characterId = utils.getRealCharacterId(player.id);
    var logData = {
        serverId: player.sid,
        registerType: player.registerType,
        loginName: player.loginName,
        playerId: player.id,
        characterId: characterId,
        battleId: battleId,
        battleData: JSON.stringify(battleData),
        date: date.getTime()
    }
    return logData;
}