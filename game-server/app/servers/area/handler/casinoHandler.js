/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-26
 * Time: 上午11:31
 * To change this template use File | Settings | File Templates.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var Code = require('../../../../../shared/code');
var area = require('../../../domain/area/area');
var handler = module.exports;
var dataApi = require('../../../util/dataApi');

//随机物品
function prize(level) {
	var array = [];
	for (var o in dataApi.casino.data) {
		array.push(prizeItem(dataApi.casino.findById(o), level));
	}
	return array;
}

function prizeItem(casino, level) {
	var items = casino.itemData;
	var allPricen = casino.allPricen;
	var array = [];
	for (var i = 0; i < items.length; i++) {
		var probability = items[i].probability / allPricen;
		if (items[i].level > level) {
			probability *= level / items[i].level;
		} else {
			probability *= items[i].level / level;
		}
		array.push(probability);
	}
	return items[prizeIndex(array)];
}

function prizeIndex(array) {
	var k = 0;
	for (var i = 0; i < array.length; i++) {
		k += array[i];
	}
	var j = Math.random() * k;
	k = 0;
	var i;
	for (i = 0; i < array.length; i++) {
		k += array[i];
		if (j < k) {
			break;
		}
	}
	return i;
}

handler.getItems = function (msg, session, next) {
	var playerId = session.get('playerId');
	var player = area.getPlayer(playerId);
	var items = prize(player.level);
	//是否进行海市次数判断
	player.casino = {
		index : 0,
		items : items
	};
	logger.error(items);
	next(null, {
		code : Code.OK,
		items : items
	});
}

handler.gambling = function (msg, session, next) {

	var playerId = session.get('playerId');
	var player = area.getPlayer(playerId);
	if (player.casino.index != msg.index) {
		next(null, {
			code : Code.FAIL
		});
		return;
	}
	var allPice = (msg.fill * player.casino.items[msg.index].price * 0.2);
	logger.debug(allPice);
	if (player.money < allPice) {
		next(null, {
			code : Code.FAIL
		});
		return;
	}
	player.money -= allPice;
	player.save();
	if (result(msg.fill)) {
		var item = player.casino.items[msg.index];
		item.itemNum = 1;
		var package = player.packageEntity.addItemWithNoType(player, item);
		player.packageEntity.save();
		next(null, {
			code : Code.OK,
			result : true,
			package : package
		});
	} else {
		next(null, {
			code : Code.OK,
			result : false
		});
	}
	player.casino.index++;
}

//随机是否成功
function result(num) {
	var grad = (35 / 100 + 0.1 * num);
	return Math.random() > grad;
}
