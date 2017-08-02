var utils = require("../app/utils/utils");
var userService = require("../app/services/userService");
var Code = require("../shared/code");
exports.battle = function(req, res) {
	var msg = req.query;
	var session = req.session;
	msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {

    });
};

var dataApi = require('../app/utils/dataApi');
/*
var pbatte = new Batte({
    		id: "iiii",
    		maxHp: 2432,
			defense: 243.2,
			attack: 668.8,
			sunderArmor: 486.4,
			speed: 668.8,
			criticalHit: 36,
			block: 9.9,
			dodge: 3.6,
			counter	: 7.2
    	});
    	var mbatte = new Batte({
    		id: "yyyy",
    		maxHp: 2432,
			defense: 608,
			attack: 486.4,
			sunderArmor: 680.96,
			speed: 486.4,
			criticalHit: 36,
			block: 7.2,
			dodge: 9,
			counter	: 10.08 
    	});
*/

exports.battle11 = function(req, res) {
	var msg = req.query;
	var session = req.session;
	msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var mid = msg.mid || "MG101021";
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
    	//console.log("formation:",player.formation);
    	var pbattes = [];
    	for(var i = 1; i <= 7; i++) {
    		if(player.formation.formation[i] == null ) {
    			pbattes.push(null);
    		}else{
    			var playerId = player.formation.formation[i].playerId;
    			if(playerId == player.id) {
    				pbattes.push(new Batte(again(player)));
    			}else{
    				console.log(playerId);
    				var character = partnerUtil.getPartner(playerId, player);
    				pbattes.push(new Batte(again(character)));
    			}
    			
    		}
    	}
    	//zxjc();
    	//console.log(pbattes);
    	//var pbatte = new Batte(again(player));
    	//console.log(pbatte);
    	var formation = dataApi.induMonstergroup.findById(mid).formation;
    	var mbattes = []; 
    	for(var i in formation) {
    		var mbatte = new Batte(dataApi.monster.findById(formation[i]));
    		mbattes.push(mbatte);
    	}
    	console.log(mbattes);
    	var result = batteRun(pbattes, mbattes);
    	utils.send(msg, res, {
    		code: Code.OK,
    		data: result
    	});
    });
}
exports.battle10 = function(req, res) {
	var msg = req.query;
	var session = req.session;
	msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var mid = msg.mid || "MG101011";
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
    	var pbatte = new Batte(player);
    	var formation = dataApi.induMonstergroup.findById(mid).formation;
    	var one = formation[0];
    	var monster = dataApi.monster.findById(one);
    	var mbatte = new Batte(monster);
    	//var batteList = [pbatte, mbatte];
    	var result = batteRun([pbatte], [mbatte]);
    	utils.send(msg, res, {
    		code: Code.OK,
    		data: result
    	});
    });
};
var partnerUtil = require("../app/utils/partnerUtil");
var Fight =  require("../app/domain/fight");
var Battle = Fight.Battle;
var dataApi = require("../app/utils/dataApi");
var redis =  require('../app/dao/redis/redis')
 , redisConfig = require('../shared/config/redis');
 var TL = require("../app/domain/tl").TL;
 var env = process.env.NODE_ENV || 'development';
 var battleDao = require("../app/dao/_battleDao");
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
exports.battle3 = function(req, res) {
	var msg = req.query;
	var session = req.session;
	msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var mid = msg.mid;
    if(!mid) {
    	return utils.send(msg, res, {
    		code: Code.FAIL,
    		err: "缺少参数mid"
    	});
    }
    var mInfo = dataApi.induMonstergroup.findById(mid);

    if(!mInfo) {
    	return utils.send(msg, res, {
    		code: Code.FAIL,
    		err: "参数错误mid"
    	});
    }
    var Key = utils.getDbKey(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var setArray = [
            ["select", redisConfig.database.SEAKING_REDIS_DB]
        ];
        console.log(mInfo);
        //try{
            var data = battleDao.battleMonster({
                player: player, 
                Key: Key,
                setArray: setArray,
                mInfo: mInfo
            });
            console.log("data:", data);
           /* console.log("setArray:",setArray);
            utils.send(msg, res , {
                code: Code.OK,
                data: data
            });*/
            redis.command(function(client) {
                client.multi(setArray).exec(function(err, result) {
                    redis.release(client);
                    if(err){return utils.send(msg, res, {
                        code: Code.FAIL,
                        err: err
                    });}
                    utils.send(msg, res , {
                        code: Code.OK,
                        data: data
                    });
                });
            });
        /*}catch(e) {
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: e
            });
        }*/
        
        
        
        /*setArray.push(["hset", Key, "tl", JSON.stringify(tl.db())]);
     	var jl = {money:0, exp: 0,items:[],bossItems:[]};
     	var ms =[];
        for(var i = 1; i <= 7; i++) {
            if(player.formation.formation[i] == null ) {
                ms.push(null);
            }else{
                var playerId = player.formation.formation[i].playerId;
                if(playerId == player.id) {
                    ms.push(new Battle(Fight.again(player), i));
                }else{
                    var character = partnerUtil.getPartner(playerId, player);
                    ms.push(new Battle(Fight.again(character), i));
                }
                
            }
        }
        var ps = [];
        var gs = [];
		for(var i =0,len =  mInfo.formation.length; i < len; i++) {
			if(mInfo.formation[i]) {
    			var info = dataApi.monster.findById(mInfo.formation[i]);
    			gs.push(new Battle(info, i+1) );
                jl.money += (info.money - 0);
                jl.exp += (info.experience-0);
                if(info.monsterType == 0){
					jl.items = jl.items.concat(info.items);
                }else{
                	jl.bossItems = jl.items.bossItems.concat(info.items);
                }             
			}
		}
		var battleData = Fight.fight(ms,gs);
		var result = {};
		if(battleData.isWin) {
			result.win = true;
			if(jl.money > 0) {
				player.money += jl.money;
				setArray.push(["hset", Key, "money", player.money]);
				result.money = player.money;
			}
			if(jl.exp > 0) {
				player.experience += jl.exp - 0;
				setArray.push(["hset", Key, "experience", player.experience]);
				result.exp = player.experience;
			}
			if(jl.items.length > 0 || jl.bossItems.length > 0) {
				result.items = []; 
                result.changeItems = [];
				var mailItem =[];
				for(var i =0,len = jl.items.length; i < len; i++) {
                    var itemInfo = jl.items[i].split("|");
					var item = {
                        itemId: itemInfo[0],
                        itemNum: itemInfo[1],
                        level: 1
                    };
					var changeItem = player.packageEntity.addItemWithNoType(player, item);
					if(changeItem != null) {
                        result.items.push(item);
						result.changeItems.push(changeItem);
					}
				}
				for(var i = 0, len = jl.bossItems.length; i < len; i++ ) {
					var itemInfo = jl.bossItems[i].split("|");
                    var item = {
                        itemId: itemInfo[0],
                        itemNum: itemInfo[1],
                        level: 1
                    };
					var changeItem = player.packageEntity.addItemWithNoType(player, item); 
					if(changeItem != null) {
                        result.items.push(item);
						result.changeItems.push(changeItem);
					}else{
						mailItem.push(item);
					}
				}
				var package = {
					itemCount :player.packageEntity.itemCount,
					items: player.packageEntity.items
				};
				setArray.push(["hset", Key, "package", JSON.stringify(package)]);
				if(mailItem.length > 0) {
					mailDao.setTimeSend({},1);
				}
			}
			
		}else{
			result.win = false;
		}
		console.log(setArray);

		data =  battleData.battle;
		data.tl = tl.value;
		data.result = result;
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err){return utils.send(msg, res, {
                    code: Code.FAIL,
                    err: err
                });}
                utils.send(msg, res , {
                    code: Code.OK,
                    data: data
                });
            });
        });*/
     });
}
exports.gmTL  = function(req, res) {
    var msg = req.query;
    var session = req.session,
    Key = utils.getDbKey(session);
    msg.Key = Key;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var tl = new TL(player.tl);
        tl.value = 100;
        var setArray = [
            ["select", redisConfig.database.SEAKING_REDIS_DB]
        ];
        setArray.push(["hset", Key, "tl", JSON.stringify(tl.db())]);
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err){return utils.send(msg, res, {
                    code: Code.FAIL,
                    err: err
                });}
            });
        });
    });
}