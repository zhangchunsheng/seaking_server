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

