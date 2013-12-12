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
	    		data: r
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

astrology.use = function(req, res) {
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
    	utils.send(msg, res, {code: Code.FAIL,err:"no index"});return;
    }
    //var Key = picecBoxName(session);
 	userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
    	player.Key = picecBoxName(session);
	    astrologyDao.use(player, index, function(err, r) {
	    	if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
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


astrology.goldbuy = function(req, res) {
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
        		data: r
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
    astrologyDao.exchange(player, msg.exchangeIndex, function(err, res) {
        if(err){utils.send(msg, res, {code: Code.FAIL});return;}
        utils.send(msg, res, {
            code: Code.OK,
            data: r
        })
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