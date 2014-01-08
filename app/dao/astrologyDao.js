var astrologyDao = module.exports;
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

/*
	astrology:{
		time:
		num:10,
		opens:[1],
		cacheItems:[],
		items:[],
		itemCount:10,
		integral: 0
	}
	
*/

function getvipNum(player) {
	return 2+player.vip || 3;
}

astrologyDao.get = function( key , callback, client) {
	var run = function(client) {
		var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
		array.push(["hget", key, "astrology"]);
		client.multi(array).exec(function(err, res) {
			if(!client){redis.release(client);}
			callback(err, res[1]);
		});

	};
	if(client){
		run(client);
	}else{
		redis.command(run);
	}
}



astrologyDao.main = function(player, callback) {
	redis.command(function(client) {
		var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
		array.push(["hget", player.Key, "astrology"]);
		client.multi(array).exec(function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			var run = function(astrology) {
				astrology.num = getvipNum(player);
				client.hset(player.Key, "astrology", JSON.stringify(astrology), function(err, res) {
					redis.release(client);
					callback(err, {astrology:astrology, money:player.money, gold: player.gameCurrency});
				});
			}
			if(!res[1]){
				var astrology ={time : Date.now()};
				astrology.items =  [];
				astrology.cacheItems =  [];
				astrology.opens = 0;
				astrology.integral =  0;
				astrology.itemCount =  10;
				run(astrology);
			}else{
				var astrology = JSON.parse(res[1]);
				var oldTime = new Date(astrology.time);
				var nowTime = new Date();
				var t = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
				if(oldTime > nowTime){
					redis.release(client);callback("time err");return;
				}else if(oldTime < t){
					console.log(t);
					console.log(oldTime);
					astrology.time = nowTime.getTime();
					run(astrology);
				}else{
					redis.release(client);callback(null, {astrology:astrology, money:player.money, gold: player.gameCurrency});
				}
				
			}
			
		});
	});

}

astrologyDao.maxCacheItems = 14;
astrologyDao.maxItems = 30;
astrologyDao.getUseMoney = function(index) {
	switch(index) {
		case 0:
			return 1000;
		break;
		case 1:
			return 2000;
		break;
		case 2:
			return 5000;
		break;
		case 3:
			return 10000;
		break;
		case 4:
			return 20000;
		break;
	}
};
astrologyDao.use = function(player,  callback) {
	//var index = parseInt(index);
	redis.command(function(client){
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var index = astrology.opens;
			if( astrology.cacheItems.length >= astrologyDao.maxCacheItems){
				redis.release(client);callback("data err");return;
			}
			var array = [];
			if(astrology.num <= 0){
				var money = astrologyDao.getUseMoney();
				if(player.money<money) {
					redis.release(client);callback("money not enough");return;
				} 
				player.money -= money;
				array.push(["hset", player.Key, "money", player.money]);
			}else{
				astrology.num--;
			}

			astrology.integral  = (astrology.integral - 0) + astrologyDao.integral(index);
			var random = astrologyDao.random(index);
			var item = astrologyDao.randomItem(index);
			astrology.cacheItems.push(item);
			if(random){astrology.opens=index+1;}else{astrology.opens=0;}
			array.push(["hset", player.Key, "astrology", JSON.stringify(astrology)]);
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {astrology:astrology, money: player.money});
			});
		}, client);
	})
	
}

astrologyDao.integral = function(index) {
	switch(index){
		case 0:
			return 20;
		case 1:
			return 50;
		case 2:
			return 100;
		case 3:
			return 200;
		case 4:
			return 500;

	}
}

function prizeItem(casino) {
    var items = casino.itemData;
    var random = Math.random();
    for (var i = 0; i < items.length; i++) {
       if(random < items[i].probability ) {
       		return  {
       			id: items[i].id,
       			//level: items[i].level || 1
       		}
       }
    }
}


var dataApi = require('../utils/dataApi');
astrologyDao.randomItem = function(index) {
	//{itemId:"D", itemNum:1, level:1}
	return prizeItem(dataApi.astrologyRandom.findById(index));
}

astrologyDao.random = function(index) {
	var r;
	switch(index) {
		case 0:
			r = 50;
			break;
		case 1:
				r = 40;
			break;
		case 2:
			r = 30;
			break;
		case 3:
			r = 50 ;
			break;
		case 4:
			r = 0;
			break;
	}
	if(100*Math.random() < r){
		return true;
	}
	return false;
}
var isBad = function(item) {
	var i = item.id.substring(1,2);
	if(i<=1) {
		return true;
	}
	return false;
}
astrologyDao.sell = function(player, callback) {
	redis.command(function(client) {
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var money = 0;
			var goodItems = [];
			var cacheItems = astrology.cacheItems;
			for(var i in cacheItems) {
				var item = cacheItems[i];
				if( isBad(item) ){
					var info = dataApi.astrology.findById(item.id);
					money += (info.price ) - 0;
				}else{
					goodItems.push(item);
				}
			}
			callback(null, {
				money: money
			});
		});
	});
}
astrologyDao.clean = function(player, callback) {
	redis.command(function(client) {
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var money = 0;
			var goodItems = [];
			for(var i = 0, l = astrology.cacheItems.length; i < l;i++) {
				var item = astrology.cacheItems[i];
				if(astrologyDao.isBadItem(item)) {
					money = astrologyDao.getValue(item);
				}else{
					goodItems.push(item);
				}
			}
			player.money += money;
			astrology.cacheItems = goodItems;
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			array.push(["hset", player.Key, "money", player.money]);
			array.push(["hset", player.Key, "astrology", JSON.stringify(astrology)]);
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {astrology: astrology, money: player.money});
			});
		});
	});
}

astrologyDao.maxBad = 10;
astrologyDao.isBadItem = function(item) {
	if(item.id.substring(1,2) <= 1) {
		return true;
	}
	return false;
}

astrologyDao.getValue = function(item) {
	return item.price;
}

astrologyDao.pickUpAll = function(Key , callback) {
	redis.command(function(client){
		astrologyDao.get(Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			if(astrology.items.length >= astrologyDao.maxItems) {
				redis.release(client);callback("items is full");return;
			}
			//var badItems = [];
			//var goodItems = [];
			var items = [];
			var hasGood = false;
			var snum = astrologyDao.maxItems - astrology.items.length  ;
			for(var i = 0,l = astrology.cacheItems.length; i < l;i++) {
				var item = astrology.cacheItems[i];
				if(astrologyDao.isBadItem(item)){
					items.push(item);
				}else{
					if(snum <= 0){
						items.push(item);
						hasGood = true;
					}else{
						astrology.items.push(item);
						snum--;
					}	
				}
			}
			var data = {};
			astrology.cacheItems = items;
			/*if(goodItems.length > 0 ) {
				data.isfull = 1;
			}*/
			if(hasGood) {
				data.isfull = 1;
			}
			data.astrology = astrology;
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", Key, "astrology", JSON.stringify(astrology)]
			];
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {astrology: astrology});
			});
		});
	});
}




astrologyDao.onceGame = 10;
astrologyDao.onceGold = 10;
astrologyDao.buy = function(player, callback) {
	if(player.gameCurrency <  astrologyDao.onceGold) {
		callback("gold money not  enough");return;
	}
	var array = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	player.gameCurrency -=  astrologyDao.onceGold;
	array.push(["hset", player.Key, "gameCurrency", player.gameCurrency]);
	
	redis.command(function(client) {
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			if(astrology.opens>=3) {
				//先获得执行
				var index = astrology.opens;
				var item = astrologyDao.randomItem(index);
				astrology.cacheItems.push(item);
				astrology.integral  = (astrology.integral - 0) + astrologyDao.integral(index);
			}			
			astrology.opens=3;
			console.log(astrology);
			array.push(["hset", player.Key, "astrology", JSON.stringify(astrology)]);
			client.multi(array).exec(function(err , res) {
				redis.release(client);
				callback(err, {astrology:astrology, gold: player.gameCurrency});
			});
		});
	});
}

astrologyDao.unlock = function(player, end,  callback) {
	redis.command(function(client) {
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var  moneys = astrologyDao.getunlockMoney(astrology.itemCount , end);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			if(moneys.money &&  (player.money < moneys.money ) ) {
				redis.release(client);callback("money not enough", null);return;
			}else{
				player.money -= moneys.money;
				array.push(["hset", player.Key, "money", player.money]);
			}
			if(moneys.gold && (player.gameCurrency < moneys.gold)) {
				redis.release(client);callback("money not enough", null);return;
			}else{
				player.gameCurrency -= moneys.gold;
				array.push(["hset", player.Key, "gameCurrency", player.gameCurrency]);
			}
			astrology.itemCount = end;
			array.push(["hset", player.Key, "astrology", JSON.stringify(astrology)]);
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, astrology: astrology});
			});

		});
	});
}

astrologyDao.getunlockMoney = function(now, end ){
	return { money:0, gold:0};
}

//抽换奖励
astrologyDao.exchange = function(Key, exchangeIndex, num ,callback) {
	if(!callback){
		callback = num;
		num = 1;
	}
	redis.command(function(client) {
		astrologyDao.get(Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			if(astrology.items.length+ num >= astrology.itemCount) {
				redis.release(client);callback("astrology bag not enough");
			}
			var r = astrologyDao.find(exchangeIndex);
			if(!r){redis.release(client);callback("not item ");return;}
			if(r.integral > astrology.integral){redis.release(client);callback("integral enough ");return;}
			astrology.integral -= r.integral;
			astrology.items.push(r.item);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", Key, "astrology", JSON.stringify(astrology)]
			]
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, astrology: astrology});
			});
		});
	});
}

astrologyDao.find = function(index) {
	return {integral :1, item:{}};
}

astrologyDao.merger = function(player) {
	var _items = [];
	redis.command(function(client){
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var all = {};
			for(var i = 0 , len = astrology.items.length ; i < len ; i ++) {
				var a = astrology.items[i];
				if(!all[a.itemId]) {
					all[a.itemId] = {
						main:a,
						all:[]
					}
				}else{
					if(all[a.itemId].main.level < a.level) {
						var _a = all[a.itemId].main ;
						all[a.itemId].main = a;
						all[a.itemId].all.push(_a);
					}else if(all[a.itemId].main.level == a.level){
						if(all[a.itemId].main.experience < a.experience) {
							var _a = all[a.itemId].main ;
							all[a.itemId].main = a;
							all.push(_a);
						}
					}else{
						all.push(a);
					}
				}

			}
			for( var i in all) {
				var main = all[i].main;
				var as = all[i].all;
				for(var i = 0, len = as.length; i< len ;i++) {
					addExperience(main, as[i]);
				}
				_items.push(main);
			}
			astrology.items  = _items;
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", Key, "astrology", JSON.stringify(astrology)]
			];
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, astrology: astrology});
			});

		}, client);
	});
}
astrologyDao.load = function(data, player, callback) {
	var index = data.index;
	redis.command(function(client){
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			
			var astrology = JSON.parse(res);
			var item = astrology.items[index];
			if(!item) {
				return callback("not item");
			}
			var itemInfo = dataApi.astrology.findById(item.id);
			var property = itemInfo.property;
			var value = itemInfo.value;
			console.log(itemInfo);
			throw new Error("ffff");
			var _item;
			var data = {};
			var character;
			if(!index) {
				character = partnerUtil.getPartner(playerId, player);
			}else {
				character = player;
			}
			if(!character) {
				return callback("not player");
			}
			
			/*switch(property) {
				case 1:
					character.attack += (itemInfo.value - _itemInfo.value);
				break;

			}*/
			//查找相同的属性的星蕴
			var items = character.astrology.items;
			var hasNull=[];
			for(var i = 0, len = character.astrology.itemCount ;i <len ;i++) {
				var __item = items[i];
				if(__item){
					var __itemInfo = dataApi.astrologys.findById(__item.id);
					if(itemInfo.property == __itemInfo.property) {
						index = i;
						_item = items[i];
						break;
					}
				}else{
					hasNull.push(i);
				}
			}
			if(!index ) {
				if(hasNull.length <=0) {
					return callback("partner astrology location not enough");
				}else{
					index = hasNull.shift();
				}
			}
			items[index] = item;
			astrology.items[index] = _item;
			player.save();
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", Key, "astrology", JSON.stringify(astrology)]
			]
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, astrology: astrology});
			});
		},client);
	});
}

function addExperience(main , o) {
	var itemInfo = dataApi.astrologys[main.itemId];
	main.experience += Math.pow(2,o.level-1)*itemInfo.experience+o.experience;
	if(main.experience > Math.pow(2, main.level)) {
		main.experience -= Math.pow(2,main.level);
		main.level += 1;
	}
}