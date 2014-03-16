var dataApi =  require("../app/utils/dataApi");
var utils = require("../app/utils/utils");
var userService = require("../app/services/userService");
var Code = require("../shared/code");
var redis =  require('../app/dao/redis/redis')
 , redisConfig = require('../shared/config/redis');
var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
var Types = {
	getItem: 1
}
var event = require("../app/domain/gameEvent");
exports.trigger = function(req, res) {
	var msg = req.query,
		eId = msg.eId;
	var session = req.session;
	var Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var eInfo = dataApi.event.findById(eId);
    if(!eInfo) {
        return utils.send(msg, res, {
            code: Code.FAIL,
            err: "没这个事件"
        });
    }
    if(eInfo.eventType == 0){
    	return utils.send(msg, res, {
    		code: Code.FAIL,
    		err: "你这都是副本事件"
    	});
	}
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
    	var setArray = [
    		["select", redisConfig.database.SEAKING_REDIS_DB]
    	];
    	var data = {};
        try{
            event.do(eInfo, player,Key, setArray, data);
        }catch(e) {
            return utils.send(msg, res, e);
        }
    	
    	console.log(setArray);
    	redis.command(function(client) {
    		client.multi(setArray).exec(function(err, result) {
    			redis.release(client);
    			if(err) {
    				utils.send(msg, res, {
    					code: Code.FAIL,
    					err:err
    				});
    			}else {
    				utils.send(msg, res, {
			    		code :Code.OK,
			    		data: data
			    	});
    			}
    		});
    	});

    	
    });
}