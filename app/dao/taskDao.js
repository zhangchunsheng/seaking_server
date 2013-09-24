/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: taskDao
 */
/**
 * task Dao, provide many function to operate dataBase
 */
var Task = require('../domain/task');
var consts = require('../consts/consts');
var taskApi = require('../utils/dataApi').task;
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var taskDao = module.exports;

/**
 * 获得taskId
 */
taskDao.getTaskId = function(client, callback) {
    var key = "taskId";
    client.incr(key, function(err, reply) {
        callback.call(this, err, reply);
    });
}

/**
 * 保存玩家任务数据
 */
taskDao.savePlayerTaskData = function(player, taskData, cb) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            var characterId = utils.getRealCharacterId(player.id);
            var key = dbUtil.getTaskKey(player.sid, player.registerType, player.loginName, characterId);
            var array = [];
            array.push(["hset", key, taskData.taskId, JSON.stringify(taskData)]);
            client.multi(array).exec(function(err, replies) {
                redis.release(client);
            });
        });
    });
}

/**
 * get task by characterId
 * @param {Number} characterId
 * @param {Function} cb
 */
taskDao.getTaskByCharacterId = function(characterId, cb) {

};

/**
 * get curTask by characterId
 * @param {Number} characterId
 * @param {Function} cb
 */
taskDao.getCurTasksByCharacterId = function(characterId, cb) {

};

/**
 * get task by characterId and taskId
 * @param {Number} characterId
 * @param {Number} taskId Task's taskId.
 * @param {Function} cb
 */
taskDao.getTaskByIds = function(characterId, taskId, cb) {

};


/**
 * create Task
 * @param {Number} characterId
 * @param {Number} taskId Task's taskId.
 * @param {Function} cb
 */
taskDao.createTask = function(character, taskId, cb) {
    
};

/**
 * update task for id
 * @param {Object} val The update parameters
 * @param {Function} cb
 */
taskDao.update = function(type, val, cb) {
    var key = dbUtil.getPlayerKey(val.serverId, val.registerType, val.loginName, val.characterId);
    var value = {
        taskId: val.taskId,
        status: val.status,
        startTime: val.startTime,
        finishTime: val.finishTime,
        taskRecord: val.taskRecord
    };
    if(typeof value.startTime == "undefined" || value.startTime == null) {
        value.startTime = 0;
    }
    if(typeof value.finishTime == "undefined" || value.finishTime == null) {
        value.finishTime = 0;
    }
    if(typeof value.taskRecord == "undefined" || value.taskRecord == null) {
        value.taskRecord = {};
    }
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).hset(key, type, JSON.stringify(value), function(err, reply) {
                if(typeof cb == "function")
                    cb(!!err);
                redis.release(client);
            })
            .exec(function (err, replies) {
                console.log(replies);
            });
    });
};

taskDao.updateTask = function(player, tasks, cb) {
    var task = {};
    var key = "";
    var value = {};
    var array = [];
    for (var type in tasks) {
        task = tasks[type].strip();
        key = dbUtil.getPlayerKey(task.serverId, task.registerType, task.loginName, task.characterId);
        value = {
            taskId: task.taskId,
            status: task.status,
            startTime: task.startTime,
            finishTime: task.finishTime,
            taskRecord: task.taskRecord,
            handOverTime: task.handOverTime
        };
        if(typeof value.startTime == "undefined" || value.startTime == null) {
            value.startTime = 0;
        }
        if(typeof value.finishTime == "undefined" || value.finishTime == null) {
            value.finishTime = 0;
        }
        if(typeof value.taskRecord == "undefined" || value.taskRecord == null) {
            value.taskRecord = {};
        }
        if(type == consts.curTaskType.CURRENT_DAY_TASK) {
            var temp = player.curTasks[type];
            temp[0] = value;
            value = temp;
        }
        array.push(["hset", key, type, JSON.stringify(value)]);
    }
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {
            client.multi(array).exec(function(err, replies) {
                if(typeof cb == "function")
                    cb(!!err);
                redis.release(client);
            });
        }).exec(function (err, replies) {
                console.log(replies);
            });
    });
}

/**
 * destroy task
 * @param {Number} characterId
 * @param {function} cb
 */
taskDao.destroy = function(characterId, cb) {

};

/**
 * new task and set event of 'save'
 * @param {Object} taskInfo
 * @return {Object} task
 */
taskDao.createNewTask = function(taskInfo, serverId, registerType, loginName, characterId, curTasks) {
    taskInfo.serverId = serverId;
    taskInfo.registerType = registerType;
    taskInfo.loginName = loginName;
    taskInfo.characterId = characterId;
    taskInfo.curTasks = curTasks;
    var task = new Task(taskInfo);
    task.on('save', function() {
        task.syncData();
    });
    return task;
};
