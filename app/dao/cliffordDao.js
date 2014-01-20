var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');
var dataApi = require('../utils/dataApi');
var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var random = function(data) {
	var r = Math.random();
	var event;
	for(var i = 0, len = data.events.length; i < len ;i++ ) {
		if(data.events[i].probability>r) {
			event = data.events[i];
			break;
		}
	}
	return event;
}
var getAstrologyNum= function(vip) {
	return vip? vip+3 : 3;
}
var getJJCNum = function(vip) {
	return vip? vip+10: 10;
}
exports.do = function(data, player, callback) {
	var curTasks = player.curTasksEntity;
	/*var randomData = dataApi.cliffordRandom.findById(2);
	var event = random(randomData);
	callback(null, event);*/
	console.log(curTasks);
	callback(null, curTasks);
}
var randomPlayerIds = {
	"1001":1
	,"1002":1
	,"1003":1
	,"1004":1
	,"1005":1
	,"1006":1
	,"1007":1
	,"1008":1
	,"1009":1
	,"1016":1
}
var addClifford = function(clifford, event){
	if(!clifford[event.id]){clifford[event.id] = [];}
	event.time = Date.now();
	clifford[event.id].push(event);
};
var getClifford = function(key, callback, client) {
	var array = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
		,["hget", key, "clifford"]
	]
	client.multi(array).exec( function(err, result) {
		if(err) { return callback(err);}
		var clifford;
		if(!result[1]){
			clifford = {

			}
		}else{
			clifford = JSON.parse(result[1]);
		}
		callback(null, clifford);
	});
}
exports.do0 = function(data, player, callback) {
	var needId = "D11070106";
	var finds = player.packageEntity.hasItem({
		itemId: needId,
		itemNum: 1
	});
	console.log("finds : ",finds);
	if(!finds) {
		return callback("no item");
	}
	var results = [];
	for(var i in finds) {
		var info = finds[i];
		var result = player.packageEntity.removeItem(info.index, info.item.itemNum);
		if(!result) {
			return callback("no item");
		}
		results.push({
			index: info.index,
			item: result
		});
	}
	var getArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	var randomData = dataApi.cliffordRandom.findById(0);
	var event = random(randomData);
	console.log(event);
	var callbackData = {
		eventId: event.id
		,changePackage: results
	}
	redis.command(function(client) {
		getClifford(data.Key, function(err, clifford) {
			if(randomPlayerIds[event.id] ) {
				var info = randomPlayer(data, player);
				if(info){
					player = info.player;
					data.Key = info.Key;
				}
			}
			
			//四舍五入了
			switch(event.id) {
				case 1001:
					console.log(player.maxHp);
					player.maxHp = (player.maxHp || 0 ) +  player.level / 2;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "maxHp", player.maxHp]);
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					console.log(setArray);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.maxHp = player.maxHp;callbackData.playerId= player.id;
						callback(err, callbackData);
					});

				break;
				case 1002:
					console.log(player.defense);
					player.defense = (player.defense || 0 )+player.level / 2;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "defense", player.defense]);
					console.log(setArray);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.defense = player.defense;callbackData.playerId= player.id;
						callback(err, callbackData)
					});
				break;
				case 1003:
					console.log(player.attack);
					player.attack = (player.attack || 0) + player.level/ 10;
					addClifford(clifford,{id: event.id, playerId: player.id});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "attack", player.attack]);
					console.log(setArray);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.attack = player.attack;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1004:
					player.sunderArmor = (player.sunderArmor || 0)+ player.level /5;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "sunderArmor", player.sunderArmor]);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.sunderArmor = player.sunderArmor;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1005:
					player.speed = (player.speed || 0) + player.level / 10;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "speed", player.speed])
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.speed = player.speed;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1006:
					player.criticalHit = (player.criticalHit || 0)+ 2;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "criticalHit", player.criticalHit])
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.criticalHit = player.criticalHit;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1007:
					player.block = (player.block || 0) + 2;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "block", player.block])
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.block = player.block;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1008:
					player.dodge =  (player.dodge || 0)+ 1;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "dodge", player.dodge])
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.dodge = player.dodge;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1009:
					player.counter =  (player.counter || 0)+ 1;
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					setArray.push(["hset", data.Key, "counter", player.counter])
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.counter = player.counter;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1010:
					console.log(player.aptitude.count);
					//player.aptitude.count ++;
					//setArray.push(["hset", data.Key, "aptitude",JSON.stringify(player.aptitude)]);
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					console.log(setArray);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.aptitude = player.aptitude;callbackData.playerId= player.id;
						callback(err, callbackData);
					});
				break;
				case 1011:
					console.log(player.ghostNum);
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					player.ghostNum = (player.ghostNum || 0 )+player.level*10;
					if(player.ghostNum > 99999) {
						player.ghostNum = 99999;
						callbackData.isFull = 1;
					}
					setArray.push(["hset", data.Key, "ghostNum", player.ghostNum]);
					console.log(setArray);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.ghostNum = player.ghostNum;
						callback(err, callbackData);					
					});
				break;
				case 1012:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					getArray.push(["hget", data.Key, "astrology"]);
					client.multi(getArray).exec(function(err, res) {
						if(err) {redis.release(client);return callback(err);}
						var astrology;
						if(res[1]){
							astrology = JSON.parse(res[1]);
							var oldTime = new Date(astrology.time);
							var nowTime = new Date();
							var t = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
							if(oldTime > nowTime){
								redis.release(client);callback("time err");return;
							}else if(oldTime < t){
								astrology.time = nowTime.getTime();
								astrology.num = getAstrologyNum(player.vip);
							}
						}else{
							astrology ={
								time : Date.now()
								,items: []
								,cacheItems: []
								,opens: 0
								,integral: 0
								,itemCount: 15
								, num : getAstrologyNum(player.vip)
							};
						}
						astrology.num ++;
						setArray.push(["hset", data.Key, "astrology", JSON.stringify(astrology)])
						console.log(setArray);
						client.multi(setArray).exec(function(err) {
							redis.release(client);
							callbackData.astrology = player.astrology;
							callback(err, callbackData)
						}); 
					});
				break;
				case 1013:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					getArray.push(["hget", data.Key, "tl"]);
					client.multi(getArray).exec(function(err, res) {
						var tl = res[1] || 0;
						tl++ ;
						if(err) {redis.release(client);return callback(err);}
						setArray.push(["hset", data.Key, "tl", tl]);
						console.log(setArray);
						client.multi(setArray).exec(function(err) {
							redis.release(client);
							callbackData.tl = tl;
							callback(err, callbackData);
						});
					});
					
				break;
				case 1014:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					getArray.push(["hget", data.Key, "jjc"]);
					client.multi(getArray).exec(function(err, res) {
						if(err) {redis.release(client);return callback(err);}
						var jjc ;
						if(res[1]) {
							jjc = JSON.parse(res[1]);
							var oldTime = new Date(jjc.time);
							var nowTime = new Date();
							var t = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
							if(oldTime < t){
								jjc.time = nowTime.getTime();
								jjc.num = getJJCNum(player.vip);
							}
						}else{
							jjc={num: getJJCNum(player.vip), time: Date.now()};
						}
						jjc.num++;
						setArray.push(["hset", data.Key, "jjc", JSON.stringify(jjc)]);
						console.log(setArray);
						client.multi(setArray).exec(function(err) {
							redis.release(client);
							callbackData.num = jjc.num;
							callback(err, callbackData)
						});
					});
					
				break;
				case 1015:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					player.money = (player.money || 0)+ player.level * 100;
					setArray.push(["hset", data.Key, "money", player.money]);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.money = player.money;
						callback(err, callbackData);
					});
				break;
				case 1016:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					player.experience = (player.experience || 0)+player.level * 50;
					setArray.push(["hset", data.Key, "experience", player.experience]);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.experience = player.experience;callbackData.playerId= player.id;
						callback(err, callbackData)
					});
				break;
				case 1017:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					player.packageEntity.itemCount++;
					if(player.packageEntity.itemCount > 64) {
						player.packageEntity.itemCount = 64;
						callbackData.isFull = 1;
					}
					var package = {
						itemCount :player.packageEntity.itemCount,
						items: player.packageEntity.items
					}
					setArray.pop();
					setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
					client.multi(setArray).exec(function(err) {
						redis.release(client);
						callbackData.itemCount = player.packageEntity.itemCount;
						callback(err,callbackData);
					});
				break;
				case 1018:
					addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
					setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
					getArray.push(["hget", data.Key, "astrology"]);
					client.multi(getArray).exec(function(err, res) {
						if(err) {redis.release(client);return callback(err);}
						var astrology;
						if(res[1]){
							astrology = JSON.parse(res[1]);
							var oldTime = new Date(astrology.time);
							var nowTime = new Date();
							var t = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
							if(oldTime > nowTime){
								redis.release(client);callback("time err");return;
							}else if(oldTime < t){
								astrology.time = nowTime.getTime();
								astrology.num = getAstrologyNum(player.vip);
							}
						}else{
							astrology ={
								time : Date.now()
								,items: []
								,cacheItems: []
								,opens: 0
								,integral: 0
								,itemCount: 15
								, num : getAstrologyNum(player.vip)
							};
						}
						if(astrology.itemCount < 48) {
							astrology.itemCount ++;
						}else{
							callbackData.isFull = 1;
						}
						setArray.push(["hset", data.Key, "astrology", JSON.stringify(astrology)])
						client.multi(setArray).exec(function(err) {
							redis.release(client);
							callbackData.itemCount = astrology.itemCount;
							callback(err, callbackData)
						}); 
					});
				break;
			}
		}, client);
		
	});

}

exports.do1 = function(data, player ,callback) {
	var needId = "D11070107";
	var finds = player.packageEntity.hasItem({
		itemId: needId,
		itemNum: 1
	});
	console.log("finds : ",finds);
	if(!finds) {
		return callback("no item");
	}
	var results = [];
	for(var i in finds) {
		var info = finds[i];
		var result = player.packageEntity.removeItem(info.index, info.item.itemNum);
		if(!result) {
			return callback("no item");
		}
		results.push({
			index: info.index,
			item: result
		});
	}
	var randomData = dataApi.cliffordRandom.findById(1);
	var event = random(randomData);
	var getArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	var callbackData = {
		eventId: event.id
		,changePackage: results
	}
	redis.command(function(client) {
			getClifford(data.Key, function(err, clifford){
				var Buff = require('../domain/buff');
				//添加buff
				var buff = new Buff({
	                useEffectId: event.event,
	                startTime: Date.now()
	            });
	            player.buffs.push(buff);
	            addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
	            //setArray.push(["hset", data.Key, "buffs", JSON.stringify(player.buffs)]);
	            setArray.push(["hset",data.Key, "clifford", JSON.stringify(clifford)]);
	            client.multi(setArray).exec(function(err) {
	            	callbackData.buff= event.event;
	            	callback(null, callbackData);
	            });
			});
			
		
	});
}
exports.do2 = function(data, player,  callback) {
	var needId = "D11070108";
	var finds = player.packageEntity.hasItem({
		itemId: needId,
		itemNum: 1
	});
	console.log("finds : ",finds);
	if(!finds) {
		return callback("no item");
	}
	var results = [];
	for(var i in finds) {
		var info = finds[i];
		var result = player.packageEntity.removeItem(info.index, info.item.itemNum);
		if(!result) {
			return callback("no item");
		}
		results.push({
			index: info.index,
			item: result
		});
	}
	var randomData = dataApi.cliffordRandom.findById(2);
	var event = random(randomData);
	var getArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var callbackData = {
		eventId: event.id
		,changePackage: results
	}
	redis.command(function(client) {
		getClifford(data.Key, function(err, clifford){
			if(event.id >= 3001  && event.id <= 3034){
				var _item = {
					itemId: event.event
					,itemNum: 1
					,level: 1
				}
				var changeItems = player.packageEntity.addItemWithNoType(player, _item).index;
				var package = {
					itemCount :player.packageEntity.itemCount,
					items: player.packageEntity.items
				}
				addClifford(clifford,{id: event.id, playerId: player.id, level: player.level});
				setArray.push(["hset", data.Key, "clifford", JSON.stringify(clifford)]);
				setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
				client.multi(setArray).exec(function(err, res) {
					redis.release(client);
					for(var i in changeItems) {
						callbackData.changePackage[i] = changeItems[i];
					}
					
					callback(err, callbackData);
				});
			}else{
				return callback("not  id");
			}
		},client);
	});
}
var randomPlayer = function(data, player) {
	console.log("formation: ",player.formation);
	var formation = [];
	for(var i in player.formation.formation) {
		if(player.formation.formation[i]){
			formation.push(player.formation.formation[i]);
		}
	}
	console.log("l: ",formation);
	var index = parseInt(Math.random() * formation.length);
	console.log(index);
	var partnerId = formation[index].playerId;
	if(partnerId == player.id) {
		return null;
	}else{
		var partnerUtil = require("../utils/partnerUtil");
		var dbUtil = require("../utils/dbUtil");
		var utils = require('../utils/utils');
		var character = partnerUtil.getPartner(partnerId, player);
		_partnerId = utils.getRealPartnerId(partnerId);
		var Key = dbUtil.getPartnerKey(data.serverId, data.registerType, data.loginName, data.characterId, _partnerId);
		return {
			player: character,
			Key : Key
		}
	}
	return player;
}
exports.gmAdd = function(data, player, callback) {
	redis.command(function(client) {
		var setArray = [
			["select", redisConfig.database.SEAKING_REDIS_DB]
		];
		var index0 = player.packageEntity.addItemWithNoType(player, {
			itemId: "D11070107",
			itemNum: 99,
			level: 1
		});
		var index1 =player.packageEntity.addItemWithNoType(player, {
			itemId: "D11070106",
			itemNum: 99,
			level: 1
		});
		var index2 =player.packageEntity.addItemWithNoType(player, {
			itemId: "D11070108",
			itemNum: 99,
			level: 1
		});
		var package = {
			itemCount :player.packageEntity.itemsCount,
			items: player.packageEntity.items
		}
		console.log(index0);
		console.log(index1);
		console.log(index2);
		setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
		console.log(setArray);
		client.multi(setArray).exec(function(err) {
			callback(err, "fk");
		});
	});
}
exports.test = function(data, player, callback) {
	


}
