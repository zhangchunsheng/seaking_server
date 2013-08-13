/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-30
 * Description: dbUtils
 */
/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: dbUtil
 */
var redis = require('../dao/redis/redis');
var utils = require('./utils');

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

dbUtil.getMultiCommand = function(key, object) {
    var array = [];
    var obj = {};
    for(var o in object) {
        obj = {};
        if(typeof object[o] == "object") {
            if(Object.prototype.toString.call(object[o]) === '[object Array]') {
                obj[o] = object[o];
                array.push(["hset", key, o, JSON.stringify(obj)]);
            } else if(o == "skills" || o == "curTasks") {
                for(var o1 in object[o]) {
                    array.push(["hset", key, o1, JSON.stringify(object[o][o1])]);
                }
            } else {
                array.push(["hset", key, o, JSON.stringify(object[o])]);
            }
        } else {
            array.push(["hset", key, o, object[o]]);
        }
    }
    return array;
}

/**
 * 保存昵称
 * @param array
 */
dbUtil.saveNickname = function(array, serverId, nickname) {
    var key = "S" + serverId + "_exist_nickname";
    array.push(["sadd", key, nickname]);
}

/**
 * 保存playerId to character
 * @param array
 * @param playerId
 * @param value
 */
dbUtil.savePlayerIdToCharacter = function(array, playerId, value) {
    array.push(["set", playerId, value]);
}

/**
 * 保存nickname to character
 * @param array
 * @param serverId
 * @param nickname
 * @param value
 */
dbUtil.saveNicknameToCharacter = function(array, serverId, nickname, value) {
    var key = "S" + serverId + "_N" + nickname;
    array.push(["set", key, value]);
}

/**
 * getCommand
 * @param array
 * @param key
 * @param field
 * @param object
 */
dbUtil.getCommand = function(array, key, field, object) {
    var obj = {};

    if(typeof object[field] == "object") {
        if(Object.prototype.toString.call(object[field]) === '[object Array]') {
            obj[field] = object[field];
            array.push(["hset", key, field, JSON.stringify(obj)]);
        } else if(field == "skills" || field == "curTasksEntity") {
            for(var o1 in object[field]) {
                array.push(["hset", key, o1, JSON.stringify(object[field][o1])]);
            }
        } else {
            array.push(["hset", key, field, JSON.stringify(object[field])]);
        }
    } else {
        array.push(["hset", key, field, object[field]]);
    }
}

dbUtil.getFieldValue = function(field, object) {
    var array = [];
    var obj = {};

    if(typeof object[field] == "object") {
        if(Object.prototype.toString.call(object[field]) === '[object Array]') {
            obj[field] = object[field];
            array.push({
                field: field,
                value: JSON.stringify(obj)
            });
        } else if(field == "skills" || field == "curTasksEntity") {
            for(var o1 in object[field]) {
                array.push({
                    field: o1,
                    value: JSON.stringify(object[field][o1])
                });
            }
        } else {
            array.push({
                field: field,
                value: JSON.stringify(object[field])
            });
        }
    } else {
        array.push({
            field: field,
            value: object[field]
        });
    }
    return array;
}

dbUtil.executeCommand = function(redis, redisConfig, array, obj, cb) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.multi(array).exec(function (err, replies) {
                utils.invokeCallback(cb, null, {
                    obj: obj,
                    reply: replies
                });
            });
        }).exec(function (err, replies) {

        });
    });
}

dbUtil.getObject = function(redis, redisConfig, array, cb) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.multi(array).exec(function (err, replies) {
                utils.invokeCallback(cb, null, replies);
            });
        }).exec(function (err, replies) {

        });
    });
}

/**
 * getPlayerKey
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 * @returns {string}
 */
dbUtil.getPlayerKey = function(serverId, registerType, loginName, characterId) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + characterId;
    return key;
}

/**
 * getBattleKey
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 * @returns {string}
 */
dbUtil.getBattleKey = function(serverId, registerType, loginName, characterId) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + characterId + "_BATTLE";
    return key;
}

/**
 * getTaskKey
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 * @returns {string}
 */
dbUtil.getTaskKey = function(serverId, registerType, loginName, characterId) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + characterId + "_TASK";
    return key;
}

/**
 * getFriendKey
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 * @returns {string}
 */
dbUtil.getFriendKey = function(serverId, registerType, loginName, characterId) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + characterId + "_Friends";
    return key;
}

/**
 * getPartnerKey
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 * @param partnerId
 * @returns {string}
 */
dbUtil.getPartnerKey = function(serverId, registerType, loginName, characterId, partnerId) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + characterId + "_P" + partnerId;
    return key;
}