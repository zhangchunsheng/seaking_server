/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: taskSync
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../consts/consts');

module.exports = {
    updateTask: function(dbclient, val, cb) {
        logger.info("updateTask");
        var redisConfig = pomelo.app.get('redis');

        var key = "S" + val.serverId + "_T" + val.registerType + "_" + val.loginName;
        logger.info(key);
        var field = "";
        if(val.type == 1) {
            field = consts.curTaskType.CURRENT_MAIN_TASK;
        } else if(val.type == 2) {
            field = consts.curTaskType.CURRENT_BRANCH_TASK;
        } else if(val.type == 3) {
            field = consts.curTaskType.CURRENT_DAY_TASK;
        } else if(val.type == 4) {
            field = consts.curTaskType.CURRENT_EXERCISE_TASK;
        }
        var taskInfo = {
            taskId: val.taskId,
            status: val.status,
            taskRecord: val.taskRecord,
            startTime: val.startTime || (new Date()).getTime()
        }
        dbclient.command(function(client) {
            client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

            }).hget(key, "characters", function(err, reply) {
                    if(reply) {
                        key = "S" + val.serverId + "_T" + val.registerType + "_" + val.loginName + "_C" + reply;

                        var array = [];
                        array.push(["hset", key, field, JSON.stringify(taskInfo)]);
                        logger.info(array);
                        client.multi(array).exec(function(err, replies) {
                            logger.info(replies);
                        });
                    }
                })
                .exec(function (err, replies) {

                });
        });
    }
};