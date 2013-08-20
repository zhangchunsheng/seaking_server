/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-26
 * Description: fightReward
 */
var Item = require('../entity/item');
var Equipment = require('../entity/equipment');
var dataApi = require('../../util/dataApi');
var area = require('../area/area');
var messageService = require('../messageService');
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * Expose 'fightReward'
 */
var fightReward = module.exports;

/**
 *
 * @param player
 * @param money
 * @param exp
 * @param items
 */
fightReward.reward = function(mainPlayer, players, monsters, isWin, cb) {
    logger.info(monsters);
    var _monsters = [];
    for(var o in monsters) {
        _monsters.push(monsters[o]);
    }
    if (_monsters.length < 1) {
        utils.invokeCallback(cb, {
            errCode: 101
        });
    }
    var i, l;
    var money = 0,
        exp = 0,
        items = [];
    var monster = {};
    var index = 0;
    for(var i = 0, l = _monsters.length ; i < l ; i++) {
        logger.info(_monsters[i].id);
        monster = dataApi.monster.findById(_monsters[i].id);
        logger.info(monster);
        if(monster.experience != 0) {
            exp += monster.experience;
        }
        if(monster.money != 0) {
            money += monster.money;
        }
        if(monster.items != "") {
            items.push(monster.items);
            index = mainPlayer.packageEntity.addItemWithNoType(mainPlayer, monster.items);
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
        utils.invokeCallback(cb, null, rewards);

        messageService.pushMessageToPlayer({uid:mainPlayer.userId, sid : mainPlayer.serverId}, 'onRewards', rewards);
    });
};