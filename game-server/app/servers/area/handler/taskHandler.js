/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: taskHandler
 */
/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var area = require('../../../domain/area/area');
var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');
var taskDao = require('../../../dao/taskDao');
var logger = require('pomelo-logger').getLogger(__filename);
var taskReward = require('../../../domain/taskReward');
var pomelo = require('pomelo');
var Code = require('../../../../../shared/code');
var logger = require('pomelo-logger').getLogger(__filename);
var formula = require('../../../consts/formula');

/**
 * Expose 'Entity' constructor
 */

var handler = module.exports;

/**
 * 接任务
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */

handler.startTask = function(msg, session, next) {
    var taskId = msg.taskId;

    var player = area.getPlayer(session.get('playerId'));
    var curTasks = player.curTasksEntity;

    var task = getTask(taskId, curTasks, next);

    if(task == null) {
        return;
    }

    if(task.status > consts.TaskStatus.NOT_START) {
        next(null, {
            code: Code.TASK.HAS_ACCEPTED
        });
        return;
    }

    var type = utils.getTaskType(task);

    player.startTask(type, task);
    var date = new Date();
    date.setTime(task.startTime);
    var taskData = {
        status: task.status,
        taskRecord: task.taskRecord,
        startTime: formula.timeFormat(date)
    };
    next(null, {
        code: consts.MESSAGE.RES,
        taskData: taskData
    });
};

function getTask(taskId, curTasks, next) {
    var task = null;
    // 已存在task
    for (var i in curTasks) {
        if (curTasks[i].taskId == taskId) {
            task = curTasks[i];
            break;
        }
    }

    if(task == null) {
        next(null, {
            code: Code.TASK.NO_CUR_TASK
        });
    }

    return task;
}

/**
 * 交任务
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */

handler.handOverTask = function(msg, session, next) {
    var taskId = msg.taskId;

    var player = area.getPlayer(session.get('playerId'));
    var curTasks = player.curTasksEntity;

    var task = getTask(taskId, curTasks, next);
    if(task == null) {
        return;
    }

    var type = utils.getTaskType(task);

    var taskIds = [];
    if (task.status === consts.TaskStatus.COMPLETED) {
        taskIds.push(type);
    }

    if(taskIds.length == 0) {
        next(null, {
            code: Code.TASK.NOT_COMPLETE
        });
        return;
    }

    taskReward.reward(player, taskIds);
    player.handOverTask(taskIds);
    next(null, {
        code: consts.MESSAGE.RES,
        ids: taskIds
    });
};

/**
 * Get history tasks of the player.
 * Handle the request from client, and response result to client
 *
 * @param {object} msg
 * @param {object} session
 * @param {function} next
 * @api public
 */
handler.getHistoryTasks = function(msg, session, next) {

};

/**
 * Get new Task for the player.
 *
 * @param {object} msg
 * @param {object} session
 * @param {function} next
 * @api public
 */

handler.getNewTask = function(msg, session, next) {

};

handler.updateTaskStep = function(msg, session, next) {

}
