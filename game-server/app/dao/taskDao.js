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
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var taskDao = module.exports;
var Task = require('../domain/task');
var consts = require('../consts/consts');
var taskApi = require('../util/dataApi').task;
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');

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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            var characterId = utils.getRealCharacterId(player.id);
            var key = dbUtil.getTaskKey(player.sid, player.registerType, player.loginName, characterId);
            var array = [];
            array.push(["hset", key, taskData.taskId, JSON.stringify(taskData)]);
            client.multi(array).exec(function(err, replies) {

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
taskDao.update = function(val, cb) {

};

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
taskDao.createNewTask = function(taskInfo, serverId, registerType, loginName, characterId) {
    taskInfo.serverId = serverId;
    taskInfo.registerType = registerType;
    taskInfo.loginName = loginName;
    taskInfo.characterId = characterId;
    var task = new Task(taskInfo);
    var app = pomelo.app;
    task.on('save', function() {
        app.get('sync').exec('taskSync.updateTask', task.id, task);
    });
    return task;
};
