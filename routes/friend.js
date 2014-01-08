var dbUtil = require("../app/utils/dbUtil");
var friendDao = require("../app/dao/friendDao");
var utils = require("../app/utils/utils");
var Code = require('../shared/code');
module.exports = {
	get: function(req, res) {
		var msg = req.query;
		var session = req.session;
		var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

	    var playerId = session.playerId;
	    var characterId = utils.getRealCharacterId(playerId);

     	var key = dbUtil.getFriendKey(serverId, registerType, loginName, characterId);
        friendDao.getFriends(key, function(err, reply) {
            if(err) {return utils.send(msg, res, {code: Code.FAIL,err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: reply
            });
        });
    	
	},
	add: function(req, res) {
		var msg = req.query;
		if(!msg.playerId) {
			return utils.send(msg ,res, {code: Code.FAIL});
		}
		var session = req.session;
		var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

	    var playerId = session.playerId;
	    var characterId = utils.getRealCharacterId(playerId);

     	var key = dbUtil.getFriendKey(serverId, registerType, loginName, characterId);
     	msg.key = key;
     	friendDao.add(msg, function(err, reply) {
            if(err) {return utils.send(msg, res, {code: Code.FAIL,err:err});}
     		utils.send(msg, res, {
     			code: Code.OK,
                data: reply 
     		})
     	})
	},
	addByName: function(req, res) {
		var msg = req.query;
		if(!msg.nickname) {
			return utils.send(msg ,res, {code: Code.FAIL});
		}
		var session = req.session;
		var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

	    var playerId = session.playerId;
	    var characterId = utils.getRealCharacterId(playerId);

     	msg.key = dbUtil.getFriendKey(serverId, registerType, loginName, characterId);
     	msg.nicknameKey = dbUtil.getNicknamePlayerKey(serverId, msg.nickname);
     	friendDao.addByName(msg, function(err, reply) {
            if(err) {return utils.send(msg, res, {code: Code.FAIL,err:err});}
     		utils.send(msg, res, {
     			code: Code.OK,
                data: reply 
     		})
     	});
	},
	remove: function(req, res) {
		var msg =req.query;
		if(!msg.playerId) {
			return utils.send(msg ,res, {code: Code.FAIL});
		}
		var session = req.session;
		var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

	    var playerId = session.playerId;
	    var characterId = utils.getRealCharacterId(playerId);

     	msg.key = dbUtil.getFriendKey(serverId, registerType, loginName, characterId);
     	friendDao.remove(msg, function(err, reply) {
     		if(!!err) {return utils.send(msg, res, {code: Code.FAIL,err:err});}
     		utils.send(msg, res, {
     			code: Code.OK
     		})
     	});
	},
    _getProperty: function(req, res) {
        var msg =req.query;
        if(!msg.playerId) {
            return utils.send(msg ,res, {code: Code.FAIL});
        }
        var session = req.session;
        var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

        var playerId = session.playerId;
        var characterId = utils.getRealCharacterId(playerId);

        msg.key = dbUtil.getFriendKey(serverId, registerType, loginName, characterId);
        friendDao.getProperty(msg , function(err, reply) {
            if(err) {return utils.send(msg, res, {code: Code.FAIL,err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: reply
            });
        });
    }
}