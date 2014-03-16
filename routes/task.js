/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: task
 */
var taskService = require('../app/services/taskService');
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var formula = require('../app/consts/formula');
var taskReward = require('../app/domain/taskReward');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 接任务
 * @param req
 * @param res
 */
exports.startTask = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var taskId = msg.taskId;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var curTasks = player.curTasksEntity;

        var task = getTask(req, res, msg, taskId, curTasks);

        if(task == null) {
            return;
        }

        if(task.status > consts.TaskStatus.NOT_START) {
            data = {
                code: Code.TASK.HAS_ACCEPTED
            };
            utils.send(msg, res, data);
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
        data = {
            code: consts.MESSAGE.RES,
            taskData: taskData
        };
        async.parallel([
            function(callback) {
                userService.updatePlayerAttribute(player, callback);
            },
            function(callback) {
                packageService.update(player.packageEntity.strip(), callback);
            },
            function(callback) {
                equipmentsService.update(player.equipmentsEntity.strip(), callback);
            },
            function(callback) {
                taskService.updateTask(player, player.curTasksEntity.strip(), callback);
            }
        ], function(err, reply) {
            utils.additionalData(data, player);
            utils.send(msg, res, data);
        });
    });
}

function getTask(req, res, msg, taskId, curTasks) {
    var task = null;
    // 已存在task
    for (var i in curTasks) {
        if (curTasks[i].taskId == taskId) {
            task = curTasks[i];
            break;
        }
    }

    var data = {};
    if(task == null) {
        data = {
            code: Code.TASK.NO_CUR_TASK
        };
        utils.send(msg, res, data);
    }

    return task;
}

/**
 * 交任务
 * @param req
 * @param res
 */
exports.handOverTask = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var taskId = msg.taskId;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var curTasks = player.curTasksEntity;

        var task = getTask(req, res, msg, taskId, curTasks);
        if(task == null) {
            return;
        }

        var type = utils.getTaskType(task);

        var taskIds = [];
        if (task.status === consts.TaskStatus.COMPLETED) {
            taskIds.push(type);
        }

        if(taskIds.length == 0) {
            data = {
                code: Code.TASK.NOT_COMPLETE
            };
            utils.send(msg, res, data);
            return;
        }

        var players = [];
        players.push(player);
        var partners = player.partners;
        for(var i = 0 ; i < partners.length ; i++) {
            players.push(partners[i]);
        }
        taskReward.reward(player, players, taskIds, function(err, rewards) { //奖励
            var nextTasks = player.handOverTask(taskIds); //下一次任务
            data = {
                code: consts.MESSAGE.RES,
                nextTasks: nextTasks,
                getItems: rewards
            };
            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(player.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                if(player.hasUpgrade) {
                    data.hasUpgrade = true;
                    data.playerInfo = player.getUpgradeInfo();
                }
                utils.send(msg, res, data);
            });
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

/**
 *
 * @param req
 * @param res
 */
exports.initTasks = function(req, res) {

}