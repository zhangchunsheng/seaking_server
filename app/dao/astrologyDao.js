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
var cleanArray = function(items) {
     for(var i = items.length -1; i >=0;i--) {
        if(items[i]==null){
            items.pop();
        }else{
            break;
        }
    }
    return items;
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
				astrology.itemCount =  15;
				run(astrology);
			}else{
				var astrology = JSON.parse(res[1]);
				var oldTime = new Date(astrology.time);
				var nowTime = new Date();
				var t = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
				if(oldTime > nowTime){
					redis.release(client);callback("time err");return;
				}else if(oldTime < t){
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
astrologyDao.maxItems = 48;
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
			var nulls = findNull(astrology.cacheItems, astrologyDao.maxCacheItems);
			if(nulls.length == 0) {
				redis.release(client);return callback("cacheItem bag not enough");
			}
			var index = astrology.opens;
			var array = [];
			if(astrology.num <= 0){
				var money = astrologyDao.getUseMoney(index) - 0;
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
			astrology.cacheItems[nulls[0]] =(item);
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
			//var goodItems = [];
			var cacheItems = astrology.cacheItems;
			/*for(var i in cacheItems) {
				var item = cacheItems[i];
				if( isBad(item) ){
					var info = dataApi.astrology.findById(item.id);
					money += (info.price ) - 0;
				}else{
					goodItems.push(item);
				}
			}*/
			//astrology.cacheItems = goodItems;
			for(var i in cacheItems) {
				var item = cacheItems[i];
				if(item) {
					if(isBad(item)) {
						var info = dataApi.astrology.findById(item.id);
						money += (info.price - 0);
						cacheItems[i] = null;
					}
				}
			}
			cleanArray(astrology.cacheItems);
			player.money += money ; 
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

var findNull = function(items, itemCount) {
	console.log(items);
	console.log(itemCount);
	var nulls = []
	for(var i = 0, len = itemCount; i<len ; i++) {
		if(!items[i]) {
			nulls.push(i);
		}
	}
	return nulls;
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
			var hasGood = false;
			/*var snum = astrologyDao.maxItems - astrology.items.length  ;
			for(var i = 0,l = astrology.cacheItems.length; i < l;i++) {
				var item = astrology.cacheItems[i];
				if(astrologyDao.isBadItem(item)){
					items.push(item);
				}else{
					if(snum <= 0){
						items.push(item);
						hasGood = true;
					}else{
						item.level = item.level || 1;
						item.exp = item.exp || 0;
						astrology.items.push(item);
						snum--;
					}	
				}
			}*/
			var nulls =  findNull(astrology.items, astrology.itemCount);
			var nullNum = nulls.length;
			console.log(nulls);
			for(var i = astrology.cacheItems.length -1; i>=0;i--){
				var item = astrology.cacheItems[i];
				if(item) {
					if(isBad(item)){

					}else{
						if(nullNum <= 0) {
							hasGood = true;
							break;
						}else{
							item.level = item.level || 1;
							item.exp = item.exp || 0;
							var l = nulls.shift();
							astrology.items[l] = item;
							astrology.cacheItems[i] = null;
							nullNum = nulls.length;
						}
					}
				}
			}
			cleanArray(astrology.cacheItems);
			var data = {};
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

astrologyDao.pickUp = function(data, player, callback) {
	var index = data.index;
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var item = astrology.cacheItems[index];
			if(!item) {
				return callback("not the item");
			}
			array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			var type;
			if(isBad(item)) {
				var info = dataApi.astrology.findById(item.id);
				player.money += (info.price - 0);
				array.push(["hset", data.Key, "money", player.money]);
				type = "s";
			}else{
				var nulls = findNull(astrology.items, astrology.itemCount)
				if(nulls.length == 0) {
					return callback("bag not enough");
				}
				item.level = 1;
				item.exp = 0;
				astrology.items[nulls[0]] = item;
				type = "c";
			}
			astrology.cacheItems[index] = null;
			cleanArray(astrology.cacheItems);
			array.push(["hset", data.Key, "astrology", JSON.stringify(astrology)]);
			
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {astrology: astrology, money: player.money, type: type});
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
				var nulls = findNull(astrology.cacheItems, astrologyDao.maxCacheItems);
				//astrology.cacheItems.push(item);
				if(nulls.length === 0) {
					redis.release(client);return callback("cache bag not enough");
				}
				var item = astrologyDao.randomItem(index);
				astrology.cacheItems[nulls[0]] = item;
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

var getunlockMoney = function(now , end) {
	var money = 0
		, gold = 0;
	if(now <15) {
		now = 15;
	}
	if(end < now) {
		return {gold: 0, money: 0}
	}
	if(end < 32) {
		money = (end - now)*((now-13)+(end - 14))*1000;
	}else if(now < 32){
		money = (32-now)*((32-14)+(now-13))*1000;
		gold = ((end-24)+(33-24) )*(end-32)/2;
	}else{
		gold = (end-now)*((end-24)+(now-23))/2;
	}
	return {
		money: money,
		gold: gold
	}
}
astrologyDao.unlock = function(data, player,  callback) {
	var end = data.boc;
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var  moneys = getunlockMoney(astrology.itemCount , end);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
			];
			if(moneys.money &&  (player.money < moneys.money ) ) {
				redis.release(client);callback("money not enough", null);return;
			}else{
				player.money -= moneys.money;
				array.push(["hset", data.Key, "money", player.money]);
			}
			if(moneys.gold && (player.gameCurrency < moneys.gold)) {
				redis.release(client);callback("money not enough", null);return;
			}else{
				player.gameCurrency -= moneys.gold;
				array.push(["hset", data.Key, "gameCurrency", player.gameCurrency]);
			}
			astrology.itemCount = end;
			array.push(["hset", data.Key, "astrology", JSON.stringify(astrology)]);
			console.log(array);
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, astrology: astrology});
			});

		});
	});
}



var getExchangeItem = function(index) {
	console.log("index :", index);
	var info = dataApi.astrologyExchange.findById(index);
	console.log(info);
	return info;
}
//兑换奖励
astrologyDao.exchange = function(data, player ,callback) {
	var index = data.index;
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var item = getExchangeItem(index);
			if(!item) {
				redis.release(client);return callback("not item");
			}
			if(astrology.integral < item.integral ) {
				redis.release(client);return callback("integral not enough");
			}
			astrology.integral -= item.integral;
			var items = astrology.items;
			var location = null ;
			for(var i =0, len = astrology.itemCount; i <len;i++) {
				if(items[i] == null) {
					location = i;
					break;
				}
			}
			if(location === null) {
				redis.release(client);return callback("astrology bag not enough");
			}
			items[location] = {
				id: item.astrologyId,
				level: item.level ||1,
				exp : item.experience || 0
			};
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", data.Key, "astrology", JSON.stringify(astrology)]
			];

			console.log(array);
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {  astrology: astrology});
			});
		});
	});
}

astrologyDao.find = function(index) {
	return {integral :1, item:{}};
}
var maxLevel = 10;
var isFullLevel = function(item) {
	if(item.level == maxLevel) {
		return true;
	}
	return false;	
}
var getAstrologyInfo = function(item) {
	return dataApi.astrology.findById(item.id);
}
var getExperience = function(item , info) {
	if(!info){
		info = getAstrologyInfo(item);
	}
	var experience = (Math.pow(2, item.level -1)) * (info.experience - 0) + (item.exp - 0);
	return experience;
}
var addExperience = function(item, experience , info) {
	if(!info){
		info =  getAstrologyInfo(item);
	} 
	var update = (Math.pow(2, item.level - 0)) * (info.experience - 0) ;
	item.exp = ( item.exp || 0 )+ experience;
	console.log("update:", update);
	if(item.exp > update) {
		item.level++;
		item.exp -= update;
	}
	console.log("add:",item);
	return item;
}
astrologyDao.merger = function(data, player, callback) {
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err) {redis.release(client); callback(err);}
			if(!res) {redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var items = astrology.items;
			var _items = [];
			var sortFunc = function(a, b) {				
				if(a == null ) {
					return 1;
				}
				if(b == null) {
					return -1;
				}
				var aInfo = dataApi.astrology.findById(a.id);
				var bInfo = dataApi.astrology.findById(b.id);
				if(aInfo.quality > bInfo.quality) {
					return -1;
				}else if(aInfo.quality < bInfo.quality){
					return 1;
				}else{
					if(a.level > b.level) {
						return -1;
					}else if(a.level < b.level) {
						return 1;
					}else {
						if(a.exp >= b.exp) {
							return -1;
						}else if(a.exp < b.exp) {
							return 1;
						}
					}
				}
			}
			items.sort(sortFunc);
			var mainIndex = 0;
			var main = items[mainIndex];
			cleanArray(items);
			
			while(items.length > _items.length + 1){
				var item = items.pop();
				if(isFullLevel(main)) {
					_items.push(main);
					mainIndex++;
					if(mainIndex >= items.length) {
						_items.push(item);
						break;
					}
					main = items[mainIndex];
				}
				//var info = getAstrologyInfo(item);
				var experience = getExperience(item);
				addExperience(main, experience);
			}
			_items.push(items.pop());
			astrology.items = _items;
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", data.Key, "astrology", JSON.stringify(astrology)]
			];
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, { astrology: astrology});
			});
		});
	});
}
astrologyDao.onceMerger  = function(data, player, callback) {
	var main = data.main
		,index = data.index;
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err) {redis.release(client); callback(err);}
			if(!res) {redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var items = astrology.items
				,mainItem = items[main]
				,otherItem = items[index];
			if(!mainItem) {
				return callback("not mainItem");
			}
			if(!otherItem) {
				return callback("not item");
			}
			var experience = getExperience(otherItem);
			addExperience(mainItem, experience);
			items[index]=null;
			cleanArray(items);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", data.Key, "astrology", JSON.stringify(astrology)]
			];
			console.log(array);
			throw new Error("...");
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, ZX:player.ZX,astrology: astrology});
			});
		});
	});
}

astrologyDao.load = function(data, player, callback) {
	var index = data.index;
	redis.command(function(client){
		astrologyDao.get(data.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}

			var	astrology =  JSON.parse(res);
			 
			var item = astrology.items[index];
			if(!item) {
				return callback("not item");
			}
			var itemInfo = dataApi.astrology.findById(item.id);
			var property = itemInfo.property;
			var value = itemInfo.value;
			
			var _item;
			//查找相同的属性的星蕴

			var _index = null;
			var items = player.ZX.i;
			var itemCount = player.ZX.c;
			var hasNull = [];
			for(var i = 0, len = itemCount ;i <len ;i++) {
				var __item = items[i];
				if(__item){

					var __itemInfo = dataApi.astrology.findById(__item.id);				
					if(itemInfo.property == __itemInfo.property) {
						
						_index = i;
						_item = items[i];
						console.log("__item:",_index);
						console.log("__item:",_item);
						break;
					}
				}else{
					hasNull.push(i);
				}
			}
			if(_index === null) {
				if(hasNull.length <=0) {
					return callback("partner astrology location not enough");
				}else{
					_index = hasNull.shift();
				}
			}
			console.log("before items: ",items);
			console.log("before astrology", astrology);
			items[_index] = item;
			astrology.items[index] = _item;
			console.log("after items: ",items);
			console.log("after astrology", astrology);
			player.save();
			console.log(data.Key);
			cleanArray(astrology.items);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", data.Key, "astrology", JSON.stringify(astrology)],
				["hset", data.PKey, "ZX", JSON.stringify(player.ZX)]
			];
			console.log(array);
			//throw new Error();
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, ZX:player.ZX,astrology: astrology});
			});
		},client);
	});
}

astrologyDao.unLoad =  function(data, player, callback) {
	var index = data.index;
	var item = player.ZX.i[index];
	console.log("before ZX:", player.ZX);
	if(!item) {
		return callback("not the astrologyitem");		
	}
	player.ZX.i[index] = null;
	console.log("after ZX:", player.ZX);
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			var items = astrology.items;
			var _index =null;
			for(var i = 0, len= astrology.itemCount; i < len ;i++) {
				if(items[i] == null) {
					_index = i;
					break;
				}
			}
			console.log("index:",index);
			if(_index === null){
				redis.release(client);return callback("bag not enough location");
			}
			console.log("before astrology:",astrology);
			items[_index] = item;
			console.log("after astrology:", astrology);
			cleanArray(player.ZX.i);
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB],
				["hset", data.Key, "astrology", JSON.stringify(astrology)],
				["hset", data.PKey, "ZX", JSON.stringify(player.ZX)]
			]
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, ZX:player.ZX,astrology: astrology});
			});
		});
	});
}
astrologyDao.gmRepair = function(data, player, callback) {
	redis.command(function(client) {
		astrologyDao.get(data.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			//astrology.integral = 9999999;
			//astrology.itemCount = 15;
			astrology.num = 3;
			//astrology.cacheItems = [];
			/*astrology.cacheItems.push({
				id: "X441",
				level: 1,
				exp: 0
			});*/
			//player.ZX.c = 9;
			var array = [
				["select", redisConfig.database.SEAKING_REDIS_DB]
				,["hset", data.Key, "astrology", JSON.stringify(astrology)]
				//,["hset", data.Key, "money", 99999999]
				//,["hset", data.Key, "ZX", JSON.stringify(player.ZX)]
			]
			console.log(array);
			//throw new Error("...");
			client.multi(array).exec(function(err, res) {
				redis.release(client);
				callback(err, {gold: player.gameCurrency, money: player.money, ZX:player.ZX,astrology: astrology});
			});
		});
	});
}