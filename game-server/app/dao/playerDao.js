/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-29
 * Description: playerDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var userDao = require('./userDao');
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

var playerDao = module.exports;

/**
 * 更改阵型
 */
playerDao.changeFormation = function(player, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    userDao.updatePlayer(player, "formation", cb);
};

/**
 * addHP
 */
playerDao.addHP = function(player, hp, cb) {
    if(player.hp < player.maxHp) {
        player.hp += hp;
    }
    if(player.hp > player.maxHp) {
        player.hp = player.maxHp;
    }
    userDao.updatePlayer(player, "hp", cb)
};

/**
 * 所有角色加血
 * @param player
 * @param hp
 * @param cb
 */
playerDao.appPlayerAndPartnersHP = function(player, hp, cb) {
    if(player.hp < player.maxHp) {
        player.hp += hp;
    }
    if(player.hp > player.maxHp) {
        player.hp = player.maxHp;
    }
    var partners = player.partners;
    for(var i = 0 ; i < partners.length ; i++) {
        if(partners[i].hp < partners[i].maxHp) {
            partners[i].hp += hp;
        }
        if(partners[i].hp > partners[i].maxHp) {
            partners[i].hp = partners[i].maxHp;
        }
    }
    playerDao.updateAllPlayers(player, "hp", cb);
};

/**
 * 给所选角色加血
 * @param mainPlayer
 * @param players
 * @param hp
 * @param cb
 */
playerDao.addPlayerHP = function(mainPlayer, players, hp, cb) {
    for(var i = 0 ; i < players.length ; i++) {
        if(players[i].hp < players[i].maxHp) {
            players[i].hp += hp;
        }
        if(players[i].hp > players[i].maxHp) {
            players[i].hp = players[i].maxHp;
        }
    }
    playerDao.updatePlayers(mainPlayer, players, "hp", cb);
};

/**
 * 更新主角和伙伴血量
 * @param players
 */
playerDao.updatePlayerAndPartnersHP = function(player, cb) {
    playerDao.updateAllPlayers(player, "hp", cb);
};

/**
 * 更新主角和伙伴血量
 * @param players
 */
playerDao.updatePlayerHP = function(mainPlayer, players, cb) {
    playerDao.updatePlayers(mainPlayer, players, "hp", cb);
};

/**
 *
 * @param player
 * @param field
 * @param cb
 */
playerDao.updateAllPlayers = function (player, field, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var serverId = player.regionId;
    var registerType = player.registerType;
    var loginName = player.loginName;

    var array = [];
    var partners = player.partners;
    var key = "";
    var characterId = 0;
    var partnerId = 0;
    var obj = {};

    // 更新mainPlayer
    characterId = userDao.getRealCharacterId(player.id);
    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    obj[player.id] = {};
    if(Object.prototype.toString.call(field) === '[object Array]') {
        var obj = {};
        for(var j = 0, l = field.length ; j < l ; j++) {
            array.push(["hset", key, field[j], player[field[j]]]);
            obj[player.id][field[j]] = player[field[j]];
        }
    } else {
        array.push(["hset", key, field, player[field]]);
        obj[player.id][field] = player[field];
    }

    // 更新partners
    for(var i = 0 ; i < partners.length ; i++) {
        partnerId = utils.getRealPartnerId(partners[i].id);
        key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId)
        obj[partners[i].id] = {};

        if(Object.prototype.toString.call(field) === '[object Array]') {
            for(var j = 0, l = field.length ; j < l ; j++) {
                array.push(["hset", key, field[j], partners[i][field[j]]]);
                obj[partners[i].id][field[j]] = partners[i][field[j]];
            }
        } else {
            array.push(["hset", key, field, partners[i][field]]);
            obj[partners[i].id][field] = partners[i][field];
        }
    }

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.multi(array).exec(function (err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, obj);
            });
        }).exec(function (err, replies) {

        });
    });
};

/**
 *
 * @param player
 * @param field
 * @param cb
 */
playerDao.updatePlayers = function (mainPlayer, players, field, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var serverId = mainPlayer.regionId;
    var registerType = mainPlayer.registerType;
    var loginName = mainPlayer.loginName;

    var array = [];
    var key = "";
    var characterId = 0;
    var partnerId = 0;
    var obj = {};

    characterId = userDao.getRealCharacterId(mainPlayer.id);

    // 更新partners
    for(var i = 0 ; i < players.length ; i++) {
        if(mainPlayer.id == players[i].id) {
            key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId)
        } else {
            partnerId = utils.getRealPartnerId(players[i].id);
            key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);
        }

        obj[players[i].id] = {};

        if(Object.prototype.toString.call(field) === '[object Array]') {
            for(var j = 0, l = field.length ; j < l ; j++) {
                array.push(["hset", key, field[j], players[i][field[j]]]);
                obj[players[i].id][field[j]] = players[i][field[j]];
            }
        } else {
            array.push(["hset", key, field, players[i][field]]);
            obj[players[i].id][field] = players[i][field];
        }
    }

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.multi(array).exec(function (err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, obj);
            });
        }).exec(function (err, replies) {

        });
    });
};

playerDao.updatePlayersAttribute = function(mainPlayer, players, field, cb) {
    var _field = [];// 更新mainPlayer
    var column = mainPlayer.updateColumn().columns;
    var flag = false;
    for(var o in column) {
        if(Object.prototype.toString.call(field) === '[object Array]') {
            flag = false;
            for(var i = 0 ; i < field.length ; i++) {
                if(o == field[i]) {
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                _field.push(o);
            }
        } else {
            if(o != field) {
                _field.push(o);
            }
        }
    }
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var serverId = mainPlayer.regionId;
    var registerType = mainPlayer.registerType;
    var loginName = mainPlayer.loginName;

    var array = [];
    var key = "";
    var characterId = 0;
    var partnerId = 0;
    var obj = {};

    characterId = userDao.getRealCharacterId(mainPlayer.id);

    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    obj[mainPlayer.id] = {};
    for(var o in _field) {
        array.push(["hset", key, _field[o], mainPlayer[_field[o]]]);
        obj[mainPlayer.id][_field[o]] = mainPlayer[_field[o]];
    }

    // 更新partners
    for(var i = 0 ; i < players.length ; i++) {
        if(mainPlayer.id == players[i].id) {
            key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
        } else {
            obj[players[i].id] = {};
            partnerId = utils.getRealPartnerId(players[i].id);
            key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);
        }

        if(Object.prototype.toString.call(field) === '[object Array]') {
            for(var j = 0, l = field.length ; j < l ; j++) {
                array.push(["hset", key, field[j], players[i][field[j]]]);
                obj[players[i].id][field[j]] = players[i][field[j]];
            }
        } else {
            array.push(["hset", key, field, players[i][field]]);
            obj[players[i].id][field] = players[i][field];
        }
    }

    logger.info(array);
    logger.info(mainPlayer);

    dbUtil.executeCommand(redis, redisConfig, array, obj, function(err, reply) {
        utils.invokeCallback(cb, err, reply.obj)
    });
};

playerDao.buyItem = function(player, wid, num, costMoney, cb) {

};