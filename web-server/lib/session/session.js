/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-29
 * Description: session
 */
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../config/redis')
    , message = require('../../i18n/zh_CN.json')
    , dbUtil = require('../util/dbUtil')
    , utils = require('../util/utils')
    , md5 = require('MD5');

var session = module.exports;

/**
 * 獲得sessionId
 */
session.getSessionId = function() {
    var sessionId = "BTG";
    var date = new Date();
    sessionId += date.getTime();
    sessionId += utils.random(100000, 999999);
    sessionId = md5(sessionId).toUpperCase();
    return sessionId;
};

/**
 * 獲得session內容
 * @param {obj} data
 * @return
 */
session.getSession = function(data, callback) {
    this.selectDb(function(client) {
        var key = "session_" + data.sessionId;
        client.get(key, function(err, reply) {
            callback.call(data, err, reply);
        });
    });
};

/**
 * 保存會話
 * session_{sessionId} {T{registerType}_{loginName}}
 */
session.saveSession = function(sessionId, userInfo) {
    this.selectDb(function(client) {
        var key = "session_" + sessionId;
        var value = "T" + userInfo.registerType + "_" + userInfo.loginName;
        client.set(key, value, function(err, reply) {

        });
    });
};

/**
 * 設置過期時間 in seconds
 */
session.expireSession = function(sessionId, expireTime) {
    this.selectDb(function(client) {
        var key = "session_" + sessionId;
        client.expire(key, expireTime, function(err, reply) {

        });
    });
}

/**
 * 刪除會話
 */
session.removeSession = function(sessionId) {
    this.selectDb(function(client) {
        var key = "session_" + sessionId;
        client.del(key, function(err, reply) {

        });
    });
};

/**
 * 選擇數據庫
 */
session.selectDb = function(cb) {
    redis.command(function(client) {
        client.select(redisConfig.SESSION_REDIS_DB, function() {
            cb(client);
        });
    });
};