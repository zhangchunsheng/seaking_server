/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: task
 */
var taskService = require('../app/services/taskService');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 接任务
 * @param req
 * @param res
 */
exports.startTask = function(req, res) {
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
}

/**
 * 交任务
 * @param req
 * @param res
 */
exports.handOverTask = function(req, res) {
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

    var players = [];
    players.push(player);
    taskReward.reward(player, players, taskIds, function(err, reply) { //奖励
        var nextTasks = player.handOverTask(taskIds); //下一次任务
        next(null, {
            code: consts.MESSAGE.RES,
            nextTasks: nextTasks
        });
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.getHistoryTasks = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.getNewTask = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.getHistoryTasks = function(req, res) {

}