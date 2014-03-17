/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: roleDao
 */
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var packageDao = require('./packageDao');
var induDao = require('./induDao');
var partnerDao = require('./partnerDao');
var playerDao = require('./playerDao');
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

var roleDao = module.exports;

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
roleDao.is_exists_nickname = function(serverId, nickname, next) {
    var key = "S" + serverId + "_exist_nickname";
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).sismember(key, nickname, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(next, null, reply);
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
roleDao.has_nickname_player = function(serverId, nickname, next) {
    var key = "S" + serverId + "_N" + nickname;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).exists(key, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(next, null, reply);
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 *
 * @param serverId
 * @param next
 */
roleDao.getNickname = function(serverId, next) {
    var key = "S" + serverId + "_canUseNickname";
    var count = 30;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).srandmember(key, count, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(next, null, reply);
            }).exec(function(err, reply) {

            });
    });
}

roleDao.removeMainPlayer = function(serverId, registerType, loginName, next) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hgetall(key, function(err, userInfo) {
                var characterId = userInfo.characters;
                var delCharacters = userInfo.delCharacters;

                if(typeof characterId == "undefined" || characterId == null || characterId == 0) {
                    redis.release(client);
                    utils.invokeCallback(next, null, characterId);
                } else {
                    var array = [];
                    //client.hset(key, "characters", 0);
                    client.hdel(key, "characters");

                    if(delCharacters == null || delCharacters == "") {
                        delCharacters = [];
                    } else {
                        delCharacters = JSON.parse(delCharacters);
                    }
                    delCharacters.push(characterId);
                    client.hset(key, "delCharacters", JSON.stringify(delCharacters));

                    // 邮件
                    dbUtil.removeMailKey(array, serverId, registerType, loginName, characterId)

                    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);

                    client.hgetall(key, function(err, replies) {
                        var partners = JSON.parse(replies.partners).partners;
                        var nickname = replies.nickname;
                        var isRandom = replies.isRandom;

                        // partners
                        var playerId = "";
                        var cId = 0;
                        var partnerId = 0;
                        for(var i = 0 ; i < partners.length ; i++) {
                            playerId = partners[i].playerId;
                            cId = partners[i].cId;

                            partnerId = utils.getRealPartnerId(playerId);
                            array.push(["del", dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId)]);
                        }

                        // 昵称
                        if(isRandom == 1) {
                            array.push(["sadd", dbUtil.getCanUseNicknameKey(serverId), nickname]);
                        }
                        dbUtil.removeNickname(array, serverId, nickname);

                        // 战斗数据
                        array.push(["del", dbUtil.getBattleKey(serverId, registerType, loginName, characterId)]);
                        // 副本数据

                        // 竞技场
                        dbUtil.removeFromArena(array, serverId, characterId);

                        array.push(["del", key]);

                        var data = {
                            registerType: registerType,
                            loginName: loginName,
                            serverId: serverId
                        }
                        ucenter.removePlayer(data);

                        client.multi(array)
                            .exec(function(err, reply) {
                                redis.release(client);
                                utils.invokeCallback(next, null, characterId);
                            });
                    });

                }
            }).exec(function(err, reply) {

            });
    });
}