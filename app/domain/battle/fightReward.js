/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-26
 * Description: fightReward
 */
var Item = require('../entity/item');
var Equipment = require('../entity/equipment');
var dataApi = require('../../utils/dataApi');
var utils = require('../../utils/utils');
var consts = require('../../consts/consts');

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
    var _monsters = [];
    for(var o in monsters) {
        _monsters.push(monsters[o]);
    }
    if (_monsters.length < 1) {
        utils.invokeCallback(cb, {
            errCode: 101
        });
    }
    if(isWin) {//战斗胜利
        var i, l;
        var money = 0,
            exp = 0,
            items = [];
        var monster = {};
        var index = [];
        for(var i = 0, l = _monsters.length ; i < l ; i++) {
            monster = dataApi.monster.findById(_monsters[i].id);
            if(monster.experience != 0) {
                exp += monster.experience;
            }
            if(monster.money != 0) {
                money += monster.money;
            }
            if(monster.items != [] && monster.items.length != 0 && monster.items != "") {
                for(var j = 0 ; j < monster.items.length ; j++) {
                    items.push(monster.items[j]);
                    index.push(mainPlayer.packageEntity.addItemWithNoType(mainPlayer, monster.items[j]));
                }
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
                items: items,
                index: index
            };
            utils.invokeCallback(cb, null, rewards);
        });
    } else {
        var money = mainPlayer.level * 10;
        mainPlayer.addMoney(money);

        mainPlayer.updatePlayerAttribute(players, function(err, reply) {
            var rewards = {
                money: money
            };
            utils.invokeCallback(cb, null, rewards);
        });
    }
};