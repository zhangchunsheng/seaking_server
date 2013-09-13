/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: userDao
 */
var redis = require('./redis/redis')
    , redisConfig = require('../../config/redis')
    , message = require('../../i18n/zh_CN.json')
    , dbUtil = require('../util/dbUtil')
    , utils = require('../util/utils')
    , session = require('../session/session');

var userDao = module.exports;

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.login = function(data, cb) {
    if(data == null || data.loginName == null || data.loginName == "") {
        cb({code: 100, msg: message.no_loginName}, null);
        return;
    }
    var validInfo = utils.validLoginName(data);
    if(validInfo.validNum < 1) {
        cb({code: 100, msg: validInfo.message}, null);
        return;
    }
    if(data.password == null || data.password == "") {
        cb({code: 100, msg: message.no_password}, null);
        return;
    }

    var that = this;

    dbUtil.selectDb(redisConfig.UC_USER_REDIS_DB, function(client) {
        var key = "T" + data.registerType + "_" + data.loginName;
        client.exists(key, function(err, reply) {
            if (reply == 0) {
                cb({code: 100, msg: message.notexists_loginName}, null);
                return;
            } else {
                client.hgetall(key, function(err, userInfo) {
                    if (data.password != userInfo.password) {
                        cb({code: 100, msg: message.password_wrong}, null);
                        return;
                    }
                    if(userInfo.sessionId != "") {
                        session.removeSession(userInfo.sessionId);
                    }
                    var sessionId = session.getSessionId();
                    session.saveSession(sessionId, data);
                    that.saveSessionId(client, sessionId, data);

                    var result = {
                        status: "200",
                        userId: userInfo.userId,
                        registerType: data.registerType,
                        loginName: data.loginName,
                        sessionId: sessionId,
                        message: message.login_success
                    };
                    cb(null, result);
                });
            }
        });
    });
}

/**
 * 创建用户
 * @param data
 * @param from
 * @param cb
 */
userDao.createUser = function(data, from, cb) {
    if(data.loginName == null || data.loginName == "") {
        cb({code: 100, msg: "no loginName"}, null);
        return;
    }
    var validInfo = utils.validLoginName(data);
    if(validInfo.validNum < 1) {
        cb({code: 100, msg: validInfo.message}, null);
        return;
    }
    if(data.password == null || data.password == "") {
        cb({code: 100, msg: message.no_password}, null);
        return;
    }

    var that = this;

    var key = "T" + data.registerType + "_" + data.loginName;
    dbUtil.selectDb(redisConfig.UC_USER_REDIS_DB, function(client) {
        client.exists(key, function(err, reply) {
            if(reply == 0) {
                that.incrUserId(client, function(err, reply) {
                    var sessionId = session.getSessionId();
                    var userId = reply;
                    data.userId = userId;
                    that.addUser(client, data);
                    session.saveSession(sessionId, data);
                    that.saveSessionId(client, sessionId, data);
                    var result = {
                        status: "200",
                        userId: reply,
                        registerType: data.registerType,
                        loginName: data.loginName,
                        sessionId: sessionId,
                        message: message.register_success
                    };
                    cb(null, result);
                });
            } else {
                cb({code: 100, msg: message.exists_loginName}, null);
                return;
            }
        });
    });
}

userDao.incrUserId = function(client, cb) {
    var key = "userId";
    client.incr(key, function(err, reply) {
        cb(err, reply);
    });
}

/**
 * 添加用戶
 * key:T{registerType}_{loginName} {userId,loginName,password,nickname,registerType,email,phoneNum,country,province,city,birthdate,registerDate,date,bz,updateBz} hashmap registerType 1 - 用户名注册 6 - email 7 - 手机号
 */
userDao.addUser = function(client, userInfo) {
    var date = new Date();
    var time = date.getTime();
    var key = "T" + userInfo.registerType + "_" + userInfo.loginName;
    client.hset(key, "userId", userInfo.userId, redis.print);//multi
    client.hset(key, "registerType", userInfo.registerType, redis.print);
    client.hset(key, "loginName", userInfo.loginName, redis.print);
    client.hset(key, "password", userInfo.password, redis.print);
    client.hset(key, "registerDate", time, redis.print);
    client.hset(key, "date", time, redis.print);
    client.hset(key, "bz", 1, redis.print);
    client.hset(key, "updateBz", 1, redis.print);

    key =  "UID_" + userInfo.userId;
    client.hset(key, "registerType", userInfo.registerType, redis.print);
    client.hset(key, "loginName", userInfo.loginName, redis.print);
};

/**
 * initUserId
 */
userDao.initUserId = function() {
    /*dbUtil.selectDb(redisConfig.UC_USER_REDIS_DB, function() {
        var key = "userId";
        redis.command(function(client) {
            client.setnx(key, 100000);
        });
    });*/
    redis.command(function(client) {
        client.multi().select(redisConfig.UC_USER_REDIS_DB).setnx(key, 100000).exec(function(err, replies) {
            redis.release(client);
            console.log(replies);
        });
    });
};

/**
 * 保存sessionId
 */
userDao.saveSessionId = function(client, sessionId, userInfo) {
    /*dbUtil.selectDb(redis, redisConfig.UC_USER_REDIS_DB, function() {
        var key = "T" + userInfo.registerType + "_" + userInfo.loginName;
        redis.command(function(client) {
            client.hset(key, "sessionId", sessionId);
        });
    });*/
    var key = "T" + userInfo.registerType + "_" + userInfo.loginName;
    client.multi().select(redisConfig.UC_USER_REDIS_DB).hset(key, "sessionId", sessionId).exec(function(err, replies) {
        redis.release(client);
        console.log(replies);
    });
};