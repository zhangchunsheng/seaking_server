var astrology = module.exports;
var astrologyDao = require("../app/dao/astrologyDao");
var utils = require('../app/utils/utils');
var redis =  require('../app/dao/redis/redis');
var Code = require('../shared/code');

var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');

astrology.main = function(req, res) {
	var msg = req.query;
	var session = req.session;
	var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

 	userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
    	player.Key = picecBoxName(session);
	    astrologyDao.main(player, function(err, r) {
	    	if(err){utils.send(msg, res, {code: Code.FAIL});return;}
	    	utils.send(msg, res, {
	    		code: Code.OK,
	    		data: {
                    bi: r.astrology.items, //背包里星蕴
                    ci: r.astrology.cacheItems, //未领取的星蕴
                    o: r.astrology.opens, //记录亮着的灯
                    yl: r.astrology.integral, //蕴力
                    boc: r.astrology.itemCount, //背包格子数
                    m: r.astrology.num  //免费次数
                }
	    	});
	    });
	});
}

astrology.unlock = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var index = msg.index;
    if(!index){
        utils.send(msg, res, {code: Code.FAIL});return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        player.Key = picecBoxName(session);
        astrologyDao.unlock(player, function(err, r) {
            if(err){utils.send(msg, res, {code: Code.FAIL});return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: r
            }); 
        });
    });
}

astrology.random = function(req, res) {
	var msg = req.query;
	var session = req.session;
	var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    //var Key = picecBoxName(session);
 	userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
    	player.Key = picecBoxName(session);
	    astrologyDao.use(player, function(err, r) {
	    	if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
	    	utils.send(msg, res, {
	    		code: Code.OK,
	    		data: r
	    	});
	    });
	});
}
astrology.sell = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.Key =  picecBoxName(session);
        astrologyDao.sell(player, function(err, r) {
            if(err){utils.send(msg, res, {code: Code.FAIL,err:err});return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: r
            });
        });
    });
}

astrology.clean = function( req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var Key = picecBoxName(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        player.Key = picecBoxName(session);
        astrologyDao.clean(player, function(err, r) {
            if(err){utils.send(msg, res, {code: Code.FAIL,err:err});return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: r
            });
        });
    });
}

astrology.pickUpAll = function(req, res) {
	var msg = req.query;
	var session = req.session;
	var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var Key = picecBoxName(session);
    //userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        //player.Key = picecBoxName(session);
	    astrologyDao.pickUpAll(Key, function(err, r) {
	    	if(err){utils.send(msg, res, {code: Code.FAIL});return;}
	    	utils.send(msg, res, {
	    		code: Code.OK,
	    		data: r
	    	});
	    });
	//});
}


astrology.buy = function(req, res) {
	var msg = req.query;
	var session = req.session;
	var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        player.Key = picecBoxName(session);
    	astrologyDao.buy(player, function(err, r) {
    		if(err){utils.send(msg, res, {code: Code.FAIL, err:err});return;}
        	player.Key = picecBoxName(session);
            utils.send(msg, res, {
        		code: Code.OK,
        		data: {
                    items: r.astrology.cacheItems,
                    opens: r.astrology.opens,
                    integral: r.astrology.integral,
                    gold: r.gold
                }
        	});
    	});
    });
}

astrology.exchange = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var index = msg.index;
    if(!index){
        utils.send(msg, res, {code: Code.FAIL});return;
    }
    var Key = picecBoxName(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        player.Key = picecBoxName(session);
        astrologyDao.exchange(player, msg.exchangeIndex, function(err, res) {
            if(err){utils.send(msg, res, {code: Code.FAIL});return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: r
            })
        });
    });
}

astrology.merage = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        player.Key = picecBoxName(session);
        astrologyDao.merage(player, function(err, res) {
            if(err){return utils.send(msg, res, {code: Code.FAIL});}
            utils.send(msg, res, {
                code: Code.OK,
                data: r
            });
        });
    });
}

function picecBoxName(session) {
    var playerId = session.playerId
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var characterId = utils.getRealCharacterId(playerId);
    return 'S'+serverId+'_T'+ registerType+'_'+ loginName+'_C'+ characterId;

}

astrology.load = function(req, res) {
    var msg = req.query;
    var index = msg.index;
    console.log(index === null);
    if(index === null) {
        return  utils.send(msg, res, {code: Code.FAIL});
    }
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        player.Key = picecBoxName(session);
        astrologyDao.load(msg, player, function(err, result) {
            if(err){return utils.send(msg, res, {code: Code.FAIL});}
            utils.send(msg, res, {
                code: Code.OK,
                data: result
            });
        });
    });
} 
astrology.test = function(req, res) {
    var msg = req.query;
    var session = req.session;
    
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var async=require("async");
    var partnerPlayerId = msg.playerId;
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        var partnerUtil = require("../app/utils/partnerUtil");
        var character = partnerUtil.getPartner(partnerPlayerId, player);
        console.log("character:",character.ZX);
        throw new Error("....");
        /*async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(player.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                utils.send(msg, res, data);
            });*/
    });
}