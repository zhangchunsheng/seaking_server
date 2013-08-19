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
var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

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
taskReward.reward = function(mainPlayer, players, ids, cb) {
    var i, l;
    var money = 0,
        exp = 0,
        items = [];
    var task = {};
    var index = 0;
    for(var i = 0, l = ids.length ; i < l ; i++) {
        task = mainPlayer.curTasksEntity[ids[i]];
        logger.info(task);
        if(task.getExp != 0) {
            exp += task.getExp;
        }
        if(task.getMoney != 0) {
            money += task.getMoney;
        }
        if(task.rewardItems != "") {
            items.push(task.rewardItems);
            index = mainPlayer.packageEntity.addItemWithNoType(task.rewardItems);
        }
    }
    //mainPlayer.addExp(exp);
    mainPlayer.addMoney(money);
    // addExp
    for(var i = 0 ; i < players.length ; i++) {
        players[i].addExp(exp);
    }

    mainPlayer.updatePlayerAttribute(players, function(err, reply) {
        var rewards = {
            exp: exp,
            money: money,
            items: items
        };
        logger.info(rewards);
        utils.invokeCallback(cb, null, rewards);

        messageService.pushMessageToPlayer({uid:mainPlayer.userId, sid : mainPlayer.serverId}, 'onRewards', rewards);
    });
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

