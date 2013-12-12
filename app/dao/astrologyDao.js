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
	return 2+player.vip || 100;
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
				astrology.opens = [1];
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
			return 10;
		break;
		case 1:
			return 20;
		break;
		case 2:
			return 30;
		break;
		case 3:
			return 40;
		break;
		case 4:
			return 50;
		break;
	}
};
//抽取数据需要修改
//数据只有到0,1 2的话就错误了
astrologyDao.use = function(player, index, callback) {
	var index = parseInt(index);
	redis.command(function(client){
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);
			if( !astrology.opens[index] || astrology.cacheItems.length >= astrologyDao.maxCacheItems){
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

			if(index != 0){
				astrology.opens[index]=0;
			}
			astrology.integral  = (astrology.integral - 0) + astrologyDao.integral(index);
			var random = astrologyDao.random(index);
			var item = astrologyDao.randomItem(index);
			astrology.cacheItems.push(item);
			if(random){astrology.opens[index+1]=1;}
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
			return 1;
		case 1:
			return 2;
		case 2:
			return 3;
		case 3:
			return 4;
		case 4:
			return 5;

	}
}

function prizeItem(casino, level) {
    var items = casino.itemData;
    var allPricen = casino.allPricen;
    var array = [];
    for (var i = 0; i < items.length; i++) {
        var probability = items[i].probability / allPricen;
        array.push(probability);
    }
    var index = prizeIndex(array);
	return items[index];
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

var dataApi = require('../utils/dataApi');
astrologyDao.randomItem = function(index) {
	//{itemId:"D", itemNum:1, level:1}
	return prizeItem(dataApi.astrology.findById(index));
}

astrologyDao.random = function(index) {
	var r;
	switch(index) {
		case 0:
			r = 40;
			break;
		case 1:
			r = 30;
			break;
		case 2:
			r = 20;
			break;
		case 3:
			r = 40 ;
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
			var array = [];
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
	if(item.level < astrologyDao.maxBad){
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
			console.log(data);
			client.hset(Key, "astrology" , JSON.stringify(astrology), function(err, res) {
				callback(err, data);
			}) ;
		});
	});
}




astrologyDao.onceGame = 10;
astrologyDao.onceGold = 1;
astrologyDao.buy = function(player, callback) {
	if(player.gameCurrency <  astrologyDao.onceGold) {
		callback("gold money not  enough");return;
	}
	var array = [];
	player.gameCurrency -=  astrologyDao.onceGold;
	array.push(["hset", player.Key, "gameCurrency", player.gameCurrency]);
	
	redis.command(function(client) {
		astrologyDao.get(player.Key, function(err, res) {
			if(err){redis.release(client);callback(err);return;}
			if(!res){redis.release(client);callback("Operator error");return;}
			var astrology = JSON.parse(res);			
			astrology.opens["3"] = 1;
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
			var array = [];
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
			client.hset(Key, "astrology", JSON.stringify(astrology), function(err, res) {
				redis.release(client);
				callback(err, astrology);
			});
		});
	});
}

astrologyDao.find = function(index) {
	return {integral :1, item:{}};
}