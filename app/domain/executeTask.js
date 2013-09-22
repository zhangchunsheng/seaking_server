/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: executeTask
 */
/**
 * Module dependencies
 */
var consts = require('../consts/consts');
var messageService = require('./messageService');
var taskData = require('../utils/dataApi').task;
var taskDao = require('../dao/taskDao');
var async = require('async');

/**
 * Expose 'executeTask'.
 */
var executeTask = module.exports;

/**
 * Update taskData.
 *
 * @param {Player} player, the player of this action
 * @param {Character} killed, the killed character(mob/player)
 * @api public
 */
executeTask.updateTaskData = function(player, itemId) {
    var tasks = player.curTasks;
    var reData = null;
    for (var id in tasks) {
        var task = tasks[id];
        if (typeof task === 'undefined' || task.status === consts.TaskStatus.COMPLETED_NOT_DELIVERY)	{
            continue;
        }
        var taskDesc = task.desc.split(';');
        var taskType = task.type;
        var taskGoal = task.taskGoal;
        var killedNum = task.completeCondition[taskDesc[1]];
        if(taskType === consts.TaskGoalType.KILL_MONSTER && taskGoal.itemId == itemId) {
            task.taskRecord.itemNum += 1;
            reData = reData || {};
            reData[id] = task.taskRecord;
            task.save();
            player.curTasks[id] = task;
            if (player.curTasks[id].taskRecord.itemNum >= taskGoal.itemNum) {
                isCompleted(player, id);
            }
        }
    }
    if (!!reData) {
        messageService.pushMessageToPlayer({uid:player.userId, sid : player.serverId}, 'onUpdateTaskData', reData);
    }
};

/**
 * PushMessage to client when the curTask is completed
 *
 * @param {Object} player
 * @param {Number} taskId
 * @api private
 */
var isCompleted = function(player, taskId) {
    player.completeTask(taskId);
    messageService.pushMessageToPlayer({uid:player.userId, sid : player.serverId}, 'onTaskCompleted', {
        taskId: taskId
    });
};

