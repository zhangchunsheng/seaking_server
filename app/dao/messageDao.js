/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: messageDao
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

var messageDao = module.exports;

messageDao.addMessage = function(serverId, registerType, loginName, characterId, message, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getPushMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"pushMessage":[]}';
                var pushMessage = JSON.parse(reply);
                pushMessage.pushMessage.push(message);
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(pushMessage), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.getMessage = function(serverId, registerType, loginName, characterId, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getPushMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"pushMessage":[]}';
                var message = JSON.parse(reply).pushMessage;
                redis.release(client);
                utils.invokeCallback(cb, null, message);
            }).exec(function (err, replies) {

            });
    });
}

messageDao.pushMessage = function(serverId, registerType, loginName, characterId, message, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getPushMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"pushMessage":[]}';
                var pushMessage = JSON.parse(reply);
                pushMessage.pushMessage.push(message);
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(pushMessage), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.removeMessage = function(serverId, registerType, loginName, characterId, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getPushMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"pushMessage":[]}';
                var pushMessage = JSON.parse(reply);
                pushMessage.pushMessage = [];
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(pushMessage), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.addTipMessage = function(serverId, registerType, loginName, characterId, message, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getTipMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{}';
                var tipMessage = JSON.parse(reply);
                if(utils.empty(tipMessage[message.type])) {
                    tipMessage[message.type] = {};
                    tipMessage[message.type].num = 0;
                }
                tipMessage[message.type].num += message.num;
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(tipMessage), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.getTipMessage = function(serverId, registerType, loginName, characterId, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getTipMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{}';
                var tipMessage = JSON.parse(reply);
                redis.release(client);
                utils.invokeCallback(cb, null, tipMessage);
            }).exec(function (err, replies) {

            });
    });
}

messageDao.removeTipMessage = function(serverId, registerType, loginName, characterId, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getTipMessageName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{}';
                var tipMessage = JSON.parse(reply);
                tipMessage = {};
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(tipMessage), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.addBattleReport = function(serverId, registerType, loginName, characterId, battleReport, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getBattleReportsName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"battleReports":[]}';
                var battleReports = JSON.parse(reply);
                battleReports.battleReports.push(battleReport);
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(battleReports), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.getBattleReport = function(serverId, registerType, loginName, characterId, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getBattleReportsName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"battleReports":[]}';
                var battleReports = JSON.parse(reply).battleReports;
                redis.release(client);
                utils.invokeCallback(cb, null, battleReports);
            }).exec(function (err, replies) {

            });
    });
}

messageDao.removeBattleReport = function(serverId, registerType, loginName, characterId, cb) {
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, dbUtil.getBattleReportsName(), function(err, reply) {
                if(typeof reply == "undefined" || reply == null || reply == "")
                    reply = '{"battleReports":[]}';
                var battleReports = JSON.parse(reply);
                battleReports.battleReports = [];
                client.hset(key, dbUtil.getPushMessageName(), JSON.stringify(battleReports), function(err, reply) {
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function (err, replies) {

            });
    });
}

messageDao.publishMessage = function(message, cb) {
    var channel = consts.messageChannel.PUSH_MESSAGE;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).publish(channel, message, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(cb, null, reply);
            }).exec(function (err, replies) {

            });
    });
}