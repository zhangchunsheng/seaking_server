/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-06
 * Description: arenaDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var redis  = require("redis");

var arenaDao = module.exports;

/**
 * 添加到竞技场
 * @param player
 * @param cb
 */
arenaDao.add = function(player, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + player.sid + "_ARENA";
    var array = [];


    //dbUtil.executeCommand(redis, redisConfig, array, {playerId: f_playerId}, cb);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).zcard(key, function(err, reply) {
            var score = reply
            if(reply == 0) {
                score = 1;
            }
            array.push(["zadd", key, score, player.id]);
            client.multi(array).exec(function (err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, score);
            });
        }).exec(function (err, replies) {

        });
    });
}

/**
 * 获得排名
 * @param player
 */
arenaDao.getRank = function(player, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + player.sid + "_ARENA";
    var array = [];


    //dbUtil.executeCommand(redis, redisConfig, array, {playerId: f_playerId}, cb);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).zrank(key, player.id, function(err, reply) {
            redis.release(client);
            utils.invokeCallback(cb, null, reply);
        }).exec(function (err, replies) {

        });
    });
}

/**
 * 交换位置
 * @param player
 * @param opponent
 */
arenaDao.exchange = function(player, opponent, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + player.sid + "_ARENA";
    var array = [];


    //dbUtil.executeCommand(redis, redisConfig, array, {playerId: f_playerId}, cb);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).zscore(key, player.id, function(err, reply) {

        }).zscore(key, opponent.id, function(err, reply) {

        }).exec(function (err, replies) {
            var player_score = replies[1];//replies[0] OK
            var opponent_score = replies[2];

            var array = [];
            array.push(["zadd", key, opponent_score, player.id]);
            array.push(["zadd", key, player_score, opponent.id]);

            client.multi(array).exec(function(err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, opponent_score);
            });
        });
    });
}
arenaDao.getOpponents = function(player, cb) {
    this.getRank(player, function(err, reply) {
        logger.debug(reply);
        reply = 11;// test
        var randoms = new Array();
        for(var i = 0 ; i < 8 ; i++) {
            if((reply = getRandom(reply)) < 0) {
                 break;
            }
            //array.unshift(reply);添加到开头和添加到末尾 最后在反转
            randoms.push(reply);
        }
        randoms = randoms.reverse();
        logger.debug(randoms);
        if(randoms.length != 0) {
            var redisConfig = pomelo.app.get('redis');
            var redis = pomelo.app.get('redisclient');
            var key = "S" + player.sid + "_ARENA";
            redis.command(function(client) {
                client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
                    var array = [];
                    for(var i = 0 ; i < randoms.length ; i++) {
                        array.push(["zrange", key, randoms[i], randoms[i]]);
                    }
                    logger.info(array);
                    client.multi(array).exec(function(err, replies) {
                        var list = new Array();
                        for(var i = 0 ; i < replies.length ; i++ ) {
                            list.push(["get", replies[i]]);
                        }

                        client.multi(list).exec(function(err, playerIds) {
                            if(!!err) {
                                logger.error(err);
                                redis.release(client);
                                utils.invokeCallback(cb, null);
                                return;
                            }

                            logger.info(playerIds);
                            var array = new Array();
                            for(var i = 0 ; i < playerIds.length ; i++ ) {
                                array.push(["hgetall", playerIds[i]]);
                            }
                            client.multi(array).exec(function(err, hgetallresult) {
                                if(!!err) {
                                    redis.release(client);
                                    utils.invokeCallback(cb, null);
                                    return;
                                }

                                var opponents = new Array();
                                for(var i = 0; i < hgetallresult.length ; i++) {
                                    opponents.push({
                                        cid: hgetallresult[i].cId,
                                        playId: hgetallresult[i].id,
                                        nickname: hgetallresult[i].nickname,
                                        rank: randoms[i]
                                    });
                                }
                                redis.release(client);
                                utils.invokeCallback(cb, null, opponents);
                            });
                        });
                    });
                }).exec(function (err, replies) {
                    // logger.error(replies);
                });
            });
        } else {
            utils.invokeCallback(cb, null,[]);
        }
    });
}

function getRandom(reply) {
    if(reply > 2000) {
        return util.random(reply - 100, reply);
    } else if(reply > 1500) {
        return util.random(reply - 80 , reply);
    } else if(reply > 1000) {
        return util.random(reply - 50, reply);
    } else if(reply > 500) {
        return util.random(reply - 30, reply);
    } else if(reply > 200) {
        return util.random(reply - 20, reply);
    } else if(reply > 100) {
        return util.random(reply - 10, reply);
    } else if(reply > 50) {
        return util.random(reply - 5, reply);
    } else if(reply > 15) {
        return util.random(reply - 2, reply);
    } else if(reply > 0) {
        return reply - 1;
    } else {
        return -1;
    }
}