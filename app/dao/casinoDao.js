/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: casinoDao
 */
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var casinoDao = module.exports;
//随机物品
function prize(level) {
    var array = [];
    var allPrice = 0;
    for (var o in dataApi.casino.data) {
    	var item = prizeItem(dataApi.casino.findById(o), level);
        array.push(item);
        allPrice += item.price;
    }
    return {
    	allPrice: allPrice,
    	items: array
    };
}

function prizeItem(casino, level) {
    var items = casino.itemData;
    console.log(items);
    var allProbability = casino.allProbability;
    var array = [];
    for (var i = 0; i < items.length; i++) {
        var probability = items[i].probability / allProbability;
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
var getRefreshNum = function(vip) {
	return 10;
}
var getGamblingNum = function(vip) {
	return 5;
}
var updateCasino = function(casino, vip) {
	if(casino.time) {
		var oldTime = new Date(casino.time);
		var nowTime = new Date();
		var t = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
		if(oldTime < t){
			casino.time = nowTime.getTime();
			casino.refreshNum = getRefreshNum(vip);
			casino.gamblingNum = getGamblingNum(vip);
			return true;
		}
	}
	casino.time = Date.now();
	return false;
}
var refreshGameCurrency = 2;
casinoDao.get = function(data, player, callback) {
	redis.command(function(client) {
		casinoDao.getCasino(data.Key, function(err, res) {
			if(err) {return callback(err);}
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			var casino;
			if(!res) {
				casino = {
					refreshNum: getRefreshNum(player.vip)
					,time: Date.now()
					,items: prize(player.level)
					,index: 3
					,gamblingNum: getGamblingNum(player.vip)
					,refreshNum: getRefreshNum(player.vip)
				};
			}else{
				casino = JSON.parse(res);
				var updateResult = updateCasino(casino);
				if(!casino.items) {
					casino.items = prize(player.level);
					casino.index = 3;
				}
			}
			array.push(["hset", data.Key, "casino", JSON.stringify(casino)]);
			client.multi(array).exec(function(err, result) {
				redis.release(client);
				callback(err, {
					casino: casino,
					gameCurrency: player.gameCurrency
				});
			});
		}, client);
	});
}
casinoDao.refresh = function(data, player, callback) {
	redis.command(function(client) {
		casinoDao.getCasino(data.Key, function(err, res) {
			if(err) {return callback(err);}
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			var casino;
			if(!res) {
				return callback("err");
			}
			var casino = JSON.parse(res);
			if(casino.refreshNum > 0) {
				casino.refreshNum--;
			}else{
				if(player.gameCurrency < refreshGameCurrency) {
					return callback("no gameCurrency");
				}
				player.gameCurrency -= refreshGameCurrency;
				array.push(["hset", data.Key, "gameCurrency", player.gameCurrency]);
			}
			casino.items = prize(player.level);		
			array.push(["hset", data.Key, "casino", JSON.stringify(casino)]);
			console.log(array);
			client.multi(array).exec(function(err, result) {
				redis.release(client);
				callback(err, {
					casino: casino,
					gameCurrency: player.gameCurrency
				});
			});
		});
	})
}
var gamblingGameCurrency = 2;
/*casinoDao.gambling = function(data, player, callback) {
	var num = data.num || 0 ;
	var lock = data.lock;
	redis.command(function(client) {
		casinoDao.getCasino(data.Key, function(err, res) {
			if(err) {return callback(err);}
			var casino = JSON.parse(res);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			var cbResult = {};
			var gameCurrency = 0;
			if(casino.gamblingNum <= 0) {
				if(player.gameCurrency < gamblingMoney) {
					return callback("no money");
				}
				gameCurrency += gamblingMoney;
			}else{
				casino.gamblingNum--;
			}
			if(lock) {
				if(player.gameCurrency < riskGameCurrency) {
					return callback("no riskGameCurrency");
				}
				if(casino.riskNum <= 0){
					return callback("no risk");
				}
				casino.riskNum--;
			}
			var money = (0.2*num+1)* casino.items.allPrice;
			if(player.money < money) {
				return callback("no money");
			}
			player.money -= money;
			array.push(["hset", data.Key, "money", player.money]);
			var items = [];
			switch(casino.index) {
				case 1:
				items.push(casino.items.items[0]);
				break;
				case 2:
				items.push(casino.items.items[0]);
				items.push(casino.items.items[1]);
				break;
				case 3:
				items.push(casino.items.items[0]);
				items.push(casino.items.items[1]);
				items.push(casino.items.items[2]);
				break;
			}
			cbResult.result = gambling(num);
			var changeItems = [];
			var   run = function(item) {
				var _item = {
					itemId: item.itemId,
					level: item.level || 1,
					itemNum: item.itemNum || 1
				};
				var index = player.packageEntity.add(_item);	
				changeItems.push({
					index: i,
					item: _item
				});
			}
			if(cbResult.result) {
				for(var i = 0, len = items.length ;i<len;i++) {
					var item = items[i];	
					run(item);
				}
				if(casino.refreshNum > 1) {
					casino.items = prize(player.level);
					casino.index = 3;
					casino.refreshNum -- ;	
				}else{
					casino.items=null;
				}
				
			}else{
				var item = items.pop();
				run(item);
				if(lock) {
					casino.index--;
					if(casino.index == 0) {
						if(casino.refreshNum > 1) {
							casino.items = prize(player.level);
							casino.index = 3;
							casino.refreshNum -- ;	
						}else{
							casino.items=null;
						}			
					}
				}else{
					if(casino.refreshNum > 0) {
						casino.items = prize(player.level);
						casino.index = 3;
						casino.refreshNum -- ;	
					}else{
						casino.items=null;
					}
				}
			}
			console.log(array);
			throw new Error("...");
			client.multi(array).exec(function(err, result) {
				redis.release(client);
				callback(err, {
					casino: casino
				});
			});
		}, client);
	});
}*/
/*casinoDao.getItems = function(data, player, callback) {
	redis.command(function(client) {
		casinoDao.getCasino(data.Key, function(err, res) {
			if(err) { return callback(err);}
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
				
			];
			var casino ;
			if(!res) {
				casino = {
					refreshNum : getRefreshNum(player.vip)
					,time: Date.now()
					,riskNum: getRiskNum(player.vip)
					,items :  prize(player.level)
					,index :3
					,gamblingNum: getGamblingNum(player.vip);
				}
			}else{
				casino = JSON.parse(res);
				var updateResult = updateCasino(casino);
				if(!updateResult) {
					if(casino.num <= 0) {
						if(player.gameCurrency < getItemsGameCurrency) {
							return callback("not gameCurrency");
						}
						player.gameCurrency -= getItemsGameCurrency;
						array.push(["hset", data.Key, "gameCurrency", player.gameCurrency]);
					}else{
						casino.num--;
					}
				}
				
				
			}
			if(casino.lock && casino.lock != 0) {
				return callback("Status is lock");
			}
			
			
			array.push(["hset", data.Key, "casino", JSON.stringify(casino)]);
			client.multi(array).exec(function(err, result) {
				redis.release(client);
				callback(err, {
					casino: casino
				});
			});
		}, client);
		
	});
}*/
var findNull = function(items, count) {
	var nulls = [];
	for(var i = 0, len = count; i < len ; i++ ) {
		if(!items[i]) {
			nulls.push(i);
		}
	}
	return nulls;
}
var riskGameCurrency = 5;
casinoDao.gambling = function(data, player, callback) {
	//加了几次注
	var allMoney = data.money ;
	var lock = data.lock || 0;
	redis.command(function(client) {
		casinoDao.getCasino(data.Key, function(err, res){
			if(err){redis.release(client);return callback(err);}
			if(!res){redis.release(client);return callback("is error");}
			var casino = JSON.parse(res);
			var cbResult = {};
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			var gameCurrency = 0;
			casino.gamblingNum--;
			var num = (allMoney/(casino.items.allPrice)-1)*5;
			if(casino.gamblingNum < 0) {
				//需要钱？
				gameCurrency-=casino.gamblingNum*2;
			}

			if(lock) {
				gameCurrency += riskGameCurrency;
			}
			var nulls = findNull(player.packageEntity.items, player.packageEntity.itemCount);
			if(nulls.length == 0) {
				return callback("bag is fulled");
			}
			
			if(num> 0) {
				//var money = (0.2*num)* casino.items.allPrice;
				var money = allMoney-casino.items.allPrice;
				if(player.money < money) {
					return callback("you money not enough");
				}
				player.money -= money;
				array.push(["hset", data.Key, "money", player.money]);
			}
			
			var items = [];
			switch(casino.index) {
				case 1:
				items.push(casino.items.items[0]);
				break;
				case 2:
				items.push(casino.items.items[0]);
				items.push(casino.items.items[1]);
				break;
				case 3:
				items.push(casino.items.items[0]);
				items.push(casino.items.items[1]);
				items.push(casino.items.items[2]);
				break;
			}
			cbResult.result = gambling(num);
			var changeItems = [];
			var run = function(item) {
				var _item = {
					itemId: item.itemId,
					level: item.level || 1,
					itemNum: item.itemNum || 1
				};
				//var index = player.packageEntity.add(_item);
				var addResult = player.packageEntity.addItemWithNoType(player, _item);
				if(!addResult) {
					redis.release(client);return callback("bag is fulled");					
				}
				var _changeItems = addResult.index;
				console.log(_changeItems);
				for(var i = 0, len = _changeItems.length; i < len ;i++) {
					var _item = _changeItems[i];
					changeItems.push(_item);
				}
				
			}
			var refreshRun = function() {
				casino.items = prize(player.level);
				casino.index = 3;
			}
			if(cbResult.result) {
				for(var i = 0, len = items.length ; i < len ; i++) {
					var item = items[i];	
					run(item);
				}
				refreshRun();
			}else{
				var item = items.pop();
				run(item);
				if(lock != 0 ) {
					casino.index--;
					if(casino.index == 0) {
						refreshRun();			
					}
				}else{
					refreshRun();
				}
			}

			var package = {
				itemCount :player.packageEntity.itemCount,
				items: player.packageEntity.items
			}
			array.push(["hset", data.Key, "package", JSON.stringify(package)]);
			if(gameCurrency > 0 ) {
				if(player.gameCurrency < gameCurrency) {
					return callback("gameCurrency not enough");
				}
				player.gameCurrency -= gameCurrency;
				array.push(["hset", data.Key, "gameCurrency", player.gameCurrency]);
			}
			array.push(["hset", data.Key, "casino", JSON.stringify(casino)]);
			cbResult.casino = casino;
			cbResult.gold = player.gameCurrency;
			cbResult.changeItems = changeItems;
			console.log(array);
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, cbResult);
			});
			//callback(null, cbResult);

		}, client);
	}) ;
}
function gambling(num) {
    var grad = (15 / 100 + 0.8 * num/(num+5));
    return Math.random() < grad;
}

casinoDao.getCasino = function(key , callback, client) {
	var run = function(client) {
		var array = [
			["select", redisConfig.database.SEAKING_REDIS_DB]
			,["hget", key, "casino"]
		];

		client.multi(array).exec(function(err, res) {
			if(!client){redis.release(client);}
			callback(err, res[1]);
		});
	};
	if(client) {
		run(client);
	}else{
		redis.command(function(client) {
			run(client);
		});
	}
}
casinoDao.gmRepair = function(data, player, callback) {
	redis.command(function(client) {
		var array = [
			["select", redisConfig.database.SEAKING_REDIS_DB]
		];
		player.packageEntity.items = {};

		var package = {
			itemCount :player.packageEntity.itemCount,
			items: player.packageEntity.items
		}
		array.push(["hset", data.Key, "package", JSON.stringify(package)]);
		client.multi(array).exec(function(err, res) {
			if(!client){redis.release(client);}
			callback(err, res[1]);
		});
	});
}

