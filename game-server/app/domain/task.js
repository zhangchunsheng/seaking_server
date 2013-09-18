/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: task
 */
/**
 * Module dependencies
 */

var util = require('util');
var Persistent = require('./persistent');
var TaskStatus = require('../consts/consts').TaskStatus;
var taskData = require('../util/dataApi').task;
var consts = require('../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * Initialize a new 'Task' with the given 'opts'.
 * Task inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */

var Task = function(opts) {
    this.id = opts.taskId;
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.kindId = opts.taskId;
    this.status = opts.status;
    this.startTime = opts.startTime || (new Date()).getTime();
    this.finishTime = opts.finishTime || 0;
    this.handOverTime = opts.handOverTime || 0;
    this.taskRecord = opts.taskRecord;
    this.step = opts.step;
    this.curTasks = opts.curTasks;

    this._initTaskInfo();
};
util.inherits(Task, Persistent);

/**
 * Expose 'Task' constructor
 */

module.exports = Task;

/**
 * Init task information form taskList.
 *
 * @api private
 */

Task.prototype._initTaskInfo = function() {
    var info = taskData.findById(this.kindId);
    if (!!info) {
        for(var key in info) {
            this[key] = info[key];
        }

        this.completeCondition = this._parseJson(info.completeCondition);
    }
};

/**
 *
 * @param taskId
 */
Task.prototype.checkTask = function(taskId) {

}

/**
 * updateRecord
 * @param player
 * @param items
 */
Task.prototype.updateRecord = function(player, type, items) {
    logger.info(this);
    logger.info(items);
    if(typeof this.id == "undefined")
        return;
    if(this.status == consts.TaskStatus.CANNOT_ACCEPT)
        return;
    if(type == consts.TaskGoalType.KILL_MONSTER) {// 击杀怪物数量
        for(var i in items) {
            if(this.taskGoal.itemId == items[i].id) {
                if(this.status == consts.TaskStatus.START_TASK) {
                    this.status = consts.TaskStatus.NOT_COMPLETED;
                    this.taskRecord = {};
                    this.taskRecord.itemNum = 0;
                }
                this.taskRecord.itemNum++;
                if(this.taskRecord.itemNum == this.taskGoal.itemNum) {
                    player.completeTask(consts.correspondingCurTaskType[this.type]);
                }
                player.taskProgress(consts.correspondingCurTaskType[this.type]);
            }
        }
        this.save();
    } else if(type == consts.TaskGoalType.GET_ITEM) {// 获得道具
        this.updateStatus(player, items.itemNum);
    } else if(type == consts.TaskGoalType.PASS_INDU) {// 通关副本
        if(this.taskGoal.itemId == items.itemId) {
            this.updateStatus(player, 1);
        }
    } else if(type == consts.TaskGoalType.PVP) {// PVP战斗
        if(this.taskGoal.needWin) {
            if(items.itemId == 1) {
                this.updateStatus(player, 1);
            }
        } else {
            this.updateStatus(player, 1);
        }
    } else if(type == consts.TaskGoalType.EQUIPMENT) {// 装备
        if(this.taskGoal.itemId == items.itemId) {
            this.updateStatus(player, 1);
        }
    } else if(type == consts.TaskGoalType.TO_LEVEL) {// 等级
        if(this.taskGoal.itemId == items.itemId) {
            this.updateStatus(player, 1);
        }
    } else if(type == consts.TaskGoalType.UPGRADE_EQUIPMENT) {// 升级装备
        if(this.taskGoal.itemId == items.itemId) {
            this.updateStatus(player, items.itemNum, true);
        }
    } else if(type == consts.TaskGoalType.BUY_ITEM) {// 购买道具
        this.updateStatus(player, items.itemNum);
    } else if(type == consts.TaskGoalType.CONSUMER_GAMECURRENCY) {// 消费
        this.updateStatus(player, 1);
    } else if(type == consts.TaskGoalType.LEARN_SKILL) {// 技能
        if(this.taskGoal.itemId == items.itemId) {
            this.updateStatus(player, 1);
        }
    } else if(type == consts.TaskGoalType.CHANGE_FORMATION) {// 阵型
        this.updateStatus(player, 1);
    }
}

/**
 * 任务预处理
 */
Task.prototype.pretreatmentTask = function(player) {
    if(this.taskGoal.type == consts.TaskGoalType.DIALOG) {//接取即完成
        this.complete(player);
    } else if(this.taskGoal.type == consts.TaskGoalType.GET_ITEM) {// 判断包裹物品
        if(player.packageEntity.hasItems(this.taskGoal)) {
            this.complete(player);
        }
    } else if(this.taskGoal.type == consts.TaskGoalType.BUY_ITEM) {
        if(player.packageEntity.hasItems(this.taskGoal)) {
            this.complete(player);
        }
    }
}

/**
 *
 * @param player
 */
Task.prototype.updateStatus = function(player, itemNum, flag) {
    if(this.status == TaskStatus.COMPLETED)
        return;
    if(this.status == consts.TaskStatus.START_TASK) {
        this.status = consts.TaskStatus.NOT_COMPLETED;
        this.taskRecord = {};
        this.taskRecord.itemNum = 0;
    }

    if(flag) {
        this.taskRecord.itemNum = itemNum;
    } else {
        this.taskRecord.itemNum += itemNum;
    }

    if(this.taskRecord.itemNum >= this.taskGoal.itemNum) {
        player.completeTask(consts.correspondingCurTaskType[this.type]);
    }
    player.taskProgress(consts.correspondingCurTaskType[this.type]);
};

/**
 *
 * @param player
 */
Task.prototype.complete = function(player) {
    if(this.status == consts.TaskStatus.START_TASK) {
        this.status = consts.TaskStatus.NOT_COMPLETED;
        this.taskRecord = {};
        this.taskRecord.itemNum = 0;
    }
    this.taskRecord.itemNum = this.taskGoal.itemNum;
    if(this.taskRecord.itemNum == this.taskGoal.itemNum) {
        player.completeTask(consts.correspondingCurTaskType[this.type]);
    }
    player.taskProgress(consts.correspondingCurTaskType[this.type]);
};

/**
 * Parse String to json.
 *
 * @param {String} data
 * @return {Object}
 * @api private
 */

Task.prototype._parseJson = function(data) {
    if(typeof data === 'undefined') {
        data = {};
    } else {
        data = JSON.parse(data);
    }
    return data;
};

/**
 * strip
 */
Task.prototype.strip = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    return {
        characterId: characterId,
        serverId: this.serverId,
        registerType: this.registerType,
        loginName: this.loginName,
        taskId: this.kindId,
        status: this.status,
        startTime: this.startTime,
        finishTime: this.finishTime,
        taskRecord: this.taskRecord
    }
};

/**
 * taskInfo
 */
Task.prototype.taskInfo = function() {
    return {
        taskId: this.kindId,
        status: this.status,
        startTime: this.startTime,
        finishTime: this.finishTime,
        taskRecord: this.taskRecord
    }
};

/**
 * logTask
 */
Task.prototype.logTask = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    var date = new Date();
    return {
        characterId: characterId,
        serverId: this.serverId,
        registerType: this.registerType,
        loginName: this.loginName,
        taskId: this.kindId,
        status: consts.TaskStatus.HANDOVERED,
        startTime: this.startTime,
        finishTime: this.finishTime,
        handOverTime: this.handOverTime,
        taskRecord: this.taskRecord,
        finishTime: date.getTime()
    }
};

/**
 * getInfo
 */
Task.prototype.getInfo = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    var obj = {
        status: this.status,
        startTime: this.startTime,
        taskRecord: this.taskRecord
    };
    var info = taskData.findById(this.taskId);
    for(var key in info) {
        obj[key] = info[key];
    }
    return obj;
};
