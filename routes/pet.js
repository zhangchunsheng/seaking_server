var casinoService = require('../app/services/casinoService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var dataApi = require('../app/utils/dataApi');
var petDao = require("../app/dao/petDao");


exports.gmUpgrade = function(req, res) {
	var msg = req.query;
	var session = req.session;
	msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
	userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
		petDao.gmUpgrade(msg, player, function(err, result) {
			if(err) {
				return utils.send(msg , res,  {code:Code.FAIL,err:err});
			}
			utils.send(msg, res, {code:Code.OK, data:result});
		});	
	});
}

exports.gmAddUpgradeItem  = function(req, res) {
	var msg = req.query, session = req.session;
	var session = req.session;
	msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
	userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
		petDao.gmAddUpgradeItem(msg, player, function(err, result) {
			if(err) {return utils.send(msg,  res, {code: Code.FAIL, err: err});}
			utils.send(msg, res, {code: Code.OK, data: result});
		});
	});
}

exports.gmAddUpgradeItem2  = function(req, res) {
    var msg = req.query, session = req.session;
    var session = req.session;
    msg.Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        petDao.gmAddUpgradeItem2(msg, player, function(err, result) {
            if(err) {return utils.send(msg,  res, {code: Code.FAIL, err: err});}
            utils.send(msg, res, {code: Code.OK, data: result});
        });
    });
}

exports.gmAdd = function(req, res) {
	var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;

    msg.Key = utils.getDbKey(session);
	userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
		petDao.gmAdd(msg, player, function(err, result) {
			if(err) {
				return utils.send(msg, res, {code: Code.FAIL, err: err});
			}
			utils.send(msg, res, {code: Code.OK, data:result});
		});
	});
}

exports.setName = function(req, res) {
	var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    if(!msg.name) {
    	return utils.send(msg, res, {code:Code.FAIL ,err: "no name"});
    }
    if(!msg.index) {
    	return utils.send(msg, res, {code: Code.FAIL, err: "no index"})
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
		petDao.setName(msg, player, function(err, result) {
			if(err) {
				return utils.send(msg, res, {code: Code.FAIL, err: err});
			}
			utils.send(msg, res, {code: Code.OK, data:result});
		});
	});
}

exports.upgradeSkill = function(req, res) {
	var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    if(!msg.index) {
        return utils.send(msg, res, {code: Code.FAIL, err: "no index"})
    }
    if(!msg.skillIndex) {
    	return utils.send(msg, res, {code:Code.FAIL ,err: "no skillIndex"});
    }
	
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
		petDao.upgradeSkill(msg, player, function(err, result) {
			if(err) {
				return utils.send(msg, res, {code: Code.FAIL, err: err});
			}
			utils.send(msg, res, {code: Code.OK, data:result});
		});
	});
}

exports.play = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    if(!msg.index) {
        return utils.send(msg, res, {code: Code.FAIL, err: "no index"})
    }
    if(!msg.playerId) {
        return utils.send(msg, res, {code: Code.FAIL, err: "no playerId"})
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        petDao.play(msg, player, function(err, result) {
            if(err) {
                return utils.send(msg, res, {code: Code.FAIL, err: err});
            }
            console.log(result);
            utils.send(msg, res, {code: Code.OK, data:result});
        });
    });
}
exports.gmAddFeedItem = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        petDao.gmAddFeedItem(msg, player, function(err, result) {
            if(err) {
                return utils.send(msg, res, {code: Code.FAIL, err: err});
            }
            utils.send(msg, res, {code: Code.OK, data:result});
        });
    });
}
exports.feed = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    if(!msg.index) {
        return utils.send(msg, res, {code: Code.FAIL, err: "no index"})
    }
    if(!msg.itemId) {
        return utils.send(msg, res, {code: Code.FAIL, err: "no itemId"});
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        petDao.feed(msg, player, function(err, result) {
            if(err) {
                return utils.send(msg, res, {code: Code.FAIL, err: err});
            }
            utils.send(msg, res, {code: Code.OK, data:result});
        });
    });
}

exports.usePet = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    if(!msg.index) {
        return utils.send(msg, res, {code: Code.FAIL, err: "no index"})
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        petDao.usePet(msg, player, function(err, result) {
            if(err) {
                return utils.send(msg, res, {code: Code.FAIL, err: err});
            }
            utils.send(msg, res, {code: Code.OK, data:result});
        });
    });
}

exports.release = function(req, res) {
	var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
	if(!msg.index) {
    	return utils.send(msg, res, {code: Code.FAIL, err: "no index"})
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
		petDao.release(msg, player, function(err, result) {
			if(err) {
				return utils.send(msg, res, {code: Code.FAIL, err: err});
			}
			utils.send(msg, res, {code: Code.OK, data:result});
		});
	});
}
exports.update = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
    msg.Key = utils.getDbKey(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        petDao.update(msg, player, function(err, result) {
            if(err) {
                return utils.send(msg, res, {code: Code.FAIL, err: err});
            }
            utils.send(msg, res, {code: Code.OK, data:result});
        });
    });
}
