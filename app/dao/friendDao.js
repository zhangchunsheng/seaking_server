var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
var dataApi = require('../utils/dataApi');
var Key = function(id) {
	var cs = id.split("_");
    return cs[0]+"_"+cs[1]+"_"+cs[2];
}
var getPlayerId = function(id) {
	var cs = id.split("_");
	return cs[0]+cs[3];
}
var getHeroId = function(cId) {
	//console.log(cId);
	return cId;
	//return dataApi.herosV2.findById(cId)["heroId"];
}
var create = function(result1, result2) {
	var r = result1;
	return {
	    id: r[0],
	    nickname: r[1],
	   // cId: r[2],
	    heroId: getHeroId(r[2]),
	    level: r[3],
	    time: result2 
	}
}
var sortFunc = function(a,b) {
	if(a.time > b.time) {
		return 1;
	}
	return 0;
}
module.exports = {
	getFriends: function(key, callback) {
		//var characterId = utils.getRealCharacterId(player.id);
    	//var key = dbUtil.getFriendKey(player.sid, player.registerType, player.loginName, characterId);
    	var array;
    	var group = [];
    	var all = {};
		callback = arguments[arguments.length-1];
    	redis.command(function(client) {
    		client.select(redisConfig.database.SEAKING_REDIS_DB, function(err) {
    			if(err) {redis.release(client);return callback(err);}

    			client.zrange(key, 0,-1, "WITHSCORES", function(err, result) {
    				if(err){redis.release(client);return callback(err);}
    				if(result.length == 0) {
    					redis.release(client);return callback(null,[]);
    				}
    				array = [];
    				for(var i = 0, len = result.length; i < len ;i +=2) {
    					array.push(["get", result[i]]);
    					group.push(result[i+1]);
    				}
    				client.multi(array).exec(function(err, result) {
    					if(err){redis.release(client);return callback(err);}
    					array = [];
	    				for(var i = 0, len = result.length; i < len ;i ++) {
	    					array.push(["hmget", result[i],"id", "nickname", "cId","level"]);
                        	array.push(["hget", Key(result[i]), "lastLoginDate"]);
	    				}
	    				client.multi(array).exec(function(err, result) {
	    					redis.release(client);
	    					if(err){return callback(err);}
	                        var players = [];
	                        for(var i =0, len= result.length; i < len; i+=2) {
	                            var player = create(result[i],result[i+1]);
	                            players.push(player);
	                        }
	                        for(var i = 0, len = group.length; i< len; i++) {
	                        	var index = group[i];
	                        	if(!all[index]) {
	                        		all[index] = []
	    						}
	    						all[index].push(players[i]);
	                        }
	                        var data = [];
	                        for(var i in all) {
	                        	all[i].sort(sortFunc);
	                        	data = data.concat(all[i]);
	                        }

	                        callback(err, data);
	    				});
    				});
    			});
    		});
    	});
	},
	add : function(data, callback) {
		var key = data.key;
		var playerId = data.playerId;
		var group = data.group || 0;
		var array ;
		var resultData = {};
		redis.command(function(client) {
			client.select(redisConfig.database.SEAKING_REDIS_DB, function(err) {
				if(err){redis.release(client); return callback(err);}
				client.ZRANK(key, playerId, function(err, result) {
					if(err){redis.release(client); return callback(err);}
					if(result!==null){redis.release(client); return callback("已经存在");}
					client.get(playerId, function(err, result) {
						if(err){redis.release(client); return callback(err);}
						var pId = result; 
						array = [];
						array.push(["hmget", pId,"id", "nickname", "cId","level"]);
	                	array.push(["hget", Key(pId), "lastLoginDate"]);
	    				client.multi(array).exec(function(err, result) {
	    					if(err){redis.release(client); return callback(err);}
	    					console.log(result);
	    					var player = create(result[0],result[1]);
	    					resultData[group] = player;
	    					client.zadd(key, group, playerId, function(err, result) {
	    						redis.release(client);
	    						callback(err, player);
	    					});
	    				});
					});
				});
			});
		});
	},
	addByName: function(data, callback) {
		var key = data.key;
		var group = data.group || 0;
		var nickname = data.nickname;
		var array;
		var resultData = {};
		var nicknameKey = data.nicknameKey;
		redis.command(function(client) {
			client.select(redisConfig.database.SEAKING_REDIS_DB, function(err) {
				if(err){redis.release(client); return callback(err);}
				client.get(nicknameKey, function(err, result) {
					if(err){redis.release(client); return callback(err);}
					//callback(null, result);
					var pId = result;
					var playerId = getPlayerId(result);
					console.log(key, playerId);
					client.ZRANK(key, playerId, function(err, result) {
						if(err){redis.release(client); return callback(err);}
						if(result!==null){redis.release(client); return callback("已经存在");}
						array = []; 
						array.push(["hmget", pId,"id", "nickname", "cId","level"]);
	                	array.push(["hget", Key(pId), "lastLoginDate"]);
	                	client.multi(array).exec(function(err, result) {
	                		if(err){redis.release(client); return callback(err);}
	    					console.log(result);
	    					var player = create(result[0],result[1]);
	    					resultData[group] = player;
	    					client.zadd(key, group, playerId, function(err, result) {
	    						redis.release(client);
	    						callback(err, player);
	    					});
	                	});
					});
				});
			});
		});
	},
	remove: function(data, callback) {
		var key = data.key;
		var playerId  = data.playerId;
		redis.command(function(client) {
			client.select(redisConfig.database.SEAKING_REDIS_DB, function(err) {
				if(err){redis.release(client); return callback(err);}
				client.zrem(key , playerId, function(err, result) {
					redis.release(client);
					if(err) {return callback(err);}
					if(result == 0){
						return callback("没这好友:"+playerId);
					}
					callback(null);
				});
			})
			
		});
	},
	getProperty: function(data, callback) {
		/*
		1 - 生命 'hp'
		2 - 攻击 'attack'
		3 - 防御 'defense'
		4 - 幸运 'sunderArmor'
		5 - 速度 'speed'
		6 - 暴击 'criticalHit'
		7 - 格挡 'block'
		8 - 闪避 'dodge'
		9 - 反击 'counter'
		*/
		var key = data.key;
		var playerId = data.playerId;
		redis.command(function(client) {
			client.select(redisConfig.database.SEAKING_REDIS_DB, function(err) {
				if(err){redis.release(client); return callback(err);}
				//是否验证有该好友
				//client.ZRANK(key, playerId, function(err, result) {
					//if(err) {redis.release(client);return callback(err);}
					//if(result===null){redis.release(client);return callback("不是你好友");}
					client.get(playerId, function(err, result) {
						if(err) {redis.release(client);return callback(err);}
						console.log(result);
						client.hmget(result,  "hp", "attack", "defense", "sunderArmor", "speed", "criticalHit", "block", "dodge", "counter", "currentSkills",function(err, res) {
							redis.release(client);
							console.log(res);
							callback(null, {
								Property: {
									1: res[0] || 0 ,
									2: res[1] || 0,
									3: res[2] || 0,
									4: res[3] || 0,
									5: res[4] || 0,
									6: res[5] || 0,
									7: res[6] || 0,
									8: res[7] || 0,
									9: res[8] || 0,
								},
								currentSkills: res[9] 
							});
						});
					});
				//});
			});
		});
	}
}