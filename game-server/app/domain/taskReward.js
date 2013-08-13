/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: taskReward
 */
/**
 * Module dependencies
 */
var Item = require('./entity/item');
var Equipment = require('./entity/equipment');
var dataApi = require('../util/dataApi');
var area = require('./area/area');
var messageService = require('./messageService');

/**
 * Expose 'taskReward'
 */
var taskReward = module.exports;

/**
 * Player get rewards after task is completed.
 * the rewards contain equipments and exprience, according to table of figure
 *
 * @param {Player} player
 * @param {Array} ids
 * @api public
 */
taskReward.reward = function(player, ids) {
    if (ids.length < 1) {
        return;
    }

    var i, l;
    var tasks = player.curTasks;
    var pos = player.getState();
    var totalItems = [], totalExp = 0;

    for (i = 0, l = ids.length; i < l; i++) {
        var id = ids[i];
        var task = tasks[id];
        var items = task.item.split(';');
        var exp = task.getExp;
        for (var j = 0; j < items.length; j++) {
            totalItems.push(items[j]);
        }
        totalExp += exp;
    }

    var equipments = this._rewardItem(totalItems, pos);
    this._rewardExp(player, totalExp);

    for (i = 0, l=equipments.length; i < l; i ++) {
        area.addEntity(equipments[i]);
    }

    messageService.pushMessageToPlayer({uid:player.userId, sid : player.serverId}, 'onRewards', equipments);
};

/**
 * Rewards of equipments.
 *
 * @param {Array} items
 * @param {Object} pos
 * @return {Object}
 * @api private
 */
taskReward._rewardItem = function(items, pos) {

};

/**
 * Rewards of exprience.
 *
 * @param {Player} player
 * @param {Number} exprience
 * @api private
 */
taskReward._rewardExp = function(player, exprience) {
    player.addExperience(exprience);
};

