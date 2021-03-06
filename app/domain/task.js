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
var taskData = require('../utils/dataApi').task;
var consts = require('../consts/consts');

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
    this.taskId = opts.taskId;
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
    if(typeof this.taskRecord.itemNum != "undefined") {
        if(typeof this.taskRecord.itemNum == "string" && this.taskRecord.itemNum.indexOf("|") > 0) {

        } else {
            this.taskRecord.itemNum = parseInt(this.taskRecord.itemNum);
        }
    }
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
    if(typeof this.id == "undefined")
        return;
    if(this.status == consts.TaskStatus.CANNOT_ACCEPT)
        return;
    if(this.status == consts.TaskStatus.NOT_START)
        return;
    if(type == consts.TaskGoalType.KILL_MONSTER) {// 击杀怪物数量
        if(this.taskGoal.itemId.indexOf("|") > 0) {
            this.updateMultiStatusWithArray(player, items);
        } else {
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
        }
        this.save();
    } else if(type == consts.TaskGoalType.GET_ITEM) {// 获得道具
        if(this.taskGoal.itemId.indexOf("|") > 0) {
            this.updateMultiStatus(player, items);
        } else {
            this.updateStatus(player, items.itemNum);
        }
    } else if(type == consts.TaskGoalType.PASS_INDU) {// 通关副本
        if(typeof items.induId != "undefined") {
            var induData = items.induData;
            var flag = true;
            for(var i = 0 ; i < induData.length ; i++) {
                if(induData[i] == null)
                    continue;
                if(typeof induData[i].died == "undefined" || induData[i].died == false) {
                    flag = false;
                    break;
                }
            }
            if(flag) {
                this.updateStatus(player, 1);
            }
        } else {
            if(this.taskGoal.itemId == items.itemId) {
                this.updateStatus(player, 1);
            }
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
        var items = [];
        items.push({
            itemId: this.taskGoal.itemId,
            itemNum: this.taskGoal.itemNum
        });
        var flag = player.packageEntity.checkItems(items);
        if(flag.length == items.length) {
            this.complete(player);
        }
    } else if(this.taskGoal.type == consts.TaskGoalType.BUY_ITEM) {
        var items = [];
        items.push({
            itemId: this.taskGoal.itemId,
            itemNum: this.taskGoal.itemNum
        });
        var flag = player.packageEntity.checkItems(items);
        if(flag.length == items.length) {
            this.complete(player);
        }
    }
}

/**
 * updateStatus
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
        this.taskRecord.itemNum = parseInt(itemNum);
    } else {
        this.taskRecord.itemNum += parseInt(itemNum);
    }

    if(this.taskRecord.itemNum >= this.taskGoal.itemNum) {
        player.completeTask(consts.correspondingCurTaskType[this.type]);
    }
    player.taskProgress(consts.correspondingCurTaskType[this.type]);
};

/**
 * updateMultiStatus
 * @param player
 * @param items
 */
Task.prototype.updateMultiStatus = function(player, items) {
    if(this.status == TaskStatus.COMPLETED)
        return;

    var itemIds = this.taskGoal.itemId.split("|");
    var itemNums = this.taskGoal.itemNum.split("|");

    if(this.status == consts.TaskStatus.START_TASK) {
        var array = [];
        for(var i = 0 ; i < itemIds.length ; i++) {
            array.push(0);
        }
        this.status = consts.TaskStatus.NOT_COMPLETED;
        this.taskRecord = {};
        this.taskRecord.itemNum = array.join("|");
    }

    var recordItemNums = this.taskRecord.itemNum.split("|");
    for(var i = 0 ; i < itemIds.length ; i++) {
        if(itemIds[i] == items.itemId) {
            recordItemNums[i] = parseInt(recordItemNums[i]) + parseInt(items.itemNum);
        }
    }
    this.taskRecord.itemNum = recordItemNums.join("|");

    var flag = [];
    for(var i = 0 ; i < itemIds.length ; i++) {
        if(parseInt(recordItemNums[i]) >= parseInt(itemNums[i])) {
            flag.push(true);
        } else {
            flag = [];
            break;
        }
    }
    if(flag.length == itemIds.length) {
        player.completeTask(consts.correspondingCurTaskType[this.type]);
    }
    player.taskProgress(consts.correspondingCurTaskType[this.type]);
};

/**
 * updateMultiStatusWithArray
 * @param player
 * @param items
 */
Task.prototype.updateMultiStatusWithArray = function(player, items) {
    if(this.status == TaskStatus.COMPLETED)
        return;
    var itemIds = this.taskGoal.itemId.split("|");
    var itemNums = this.taskGoal.itemNum.split("|");

    if(this.status == consts.TaskStatus.START_TASK) {
        var array = [];
        for(var i = 0 ; i < itemIds.length ; i++) {
            array.push(0);
        }
        this.status = consts.TaskStatus.NOT_COMPLETED;
        this.taskRecord = {};
        this.taskRecord.itemNum = array.join("|");
    }
    var recordItemNums = this.taskRecord.itemNum.split("|");

    for(var i in items) {
        for(var j = 0 ; j < itemIds.length ; j++) {
            if(itemIds[j] == items[i].id) {
                recordItemNums[j] = parseInt(recordItemNums[j]) + 1;
            }
        }
    }

    this.taskRecord.itemNum = recordItemNums.join("|");

    var flag = [];
    for(var i = 0 ; i < itemIds.length ; i++) {
        if(parseInt(recordItemNums[i]) >= parseInt(itemNums[i])) {
            flag.push(true);
        } else {
            flag = [];
            break;
        }
    }
    if(flag.length == itemIds.length) {
        player.completeTask(consts.correspondingCurTaskType[this.type]);
    }
    player.taskProgress(consts.correspondingCurTaskType[this.type]);
};

/**
 * complete
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
        taskId: this.taskId,
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
        taskId: this.taskId,
        status: this.status,
        startTime: this.startTime,
        finishTime: this.finishTime,
        taskRecord: this.taskRecord,
        taskGoal: this.taskGoal
    }
};

Task.prototype.initTask = function(task) {
    this.taskId = task.taskId;
    this.status = task.status;
    this.taskRecord = task.taskRecord;
    this.startTime = task.startTime;
    this.finishTime = task.finishTime;
    this.handOverTime = task.handOverTime;
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
        taskId: this.taskId,
        status: consts.TaskStatus.HANDOVERED,
        startTime: this.startTime,
        finishTime: this.finishTime,
        handOverTime: this.handOverTime,
        taskRecord: this.taskRecord,
        finishTime: date.getTime()
    }
};

Task.prototype.syncData = function() {

}

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
