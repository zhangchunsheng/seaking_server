var astrology = module.exports;
var astrologyDao = require("../app/dao/astrologyDao");
var utils = require('../app/utils/utils');
var redis =  require('../app/dao/redis/redis');
var Code = require('../shared/code');

var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
//关于升级：
//升级修改数据库中  星蕴的开启的个数   
var getCi = function(astrology) {
    var ci = [];
    astrology.cacheItems.forEach(function(value) {
        if(value) {
            ci.push(value.id);
        }else{
            ci.push(null);
        }
        
    });
    return ci;
}

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
            var ci = getCi(r.astrology);
	    	utils.send(msg, res, {
	    		code: Code.OK,
	    		data: {
                    bi: r.astrology.items, //背包里星蕴
                    ci: ci, //未领取的星蕴
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
    var boc = msg.boc;
    if(!boc){
        utils.send(msg, res, {code: Code.FAIL, err: "not boc" });return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key = picecBoxName(session);
        astrologyDao.unlock(msg, player, function(err, r) {
            if(err){utils.send(msg, res, {code: Code.FAIL});return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    gc: r.gold
                    ,money: r.money
                    ,boc: boc
                }
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
	    	var ci = getCi(r.astrology);
            utils.send(msg, res, {
	    		code: Code.OK,
	    		data: {
                    ci: ci,
                    money: r.money,
                    m: r.astrology.num,
                    o: r.astrology.opens,
                    yl: r.astrology.integral
                }
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
            var ci = getCi(r.astrology);
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    money: r.money,
                    ci: ci
                }
            });
        });
    });
}

astrology.pickUp = function(req, res) {
    var msg = req.query;
    if(msg.index == null) {
        return utils.send(msg,res , {code: Code.FAIL, err: "not index"})        
    }
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
   
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        msg.Key = picecBoxName(session);
        astrologyDao.pickUp(msg, player, function(err, r) {
            if(err) {return utils.send(msg, res, {code: Code.FAIL});}
            var ci = getCi(r.astrology);
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    ci: ci,
                    bi:  r.astrology.items,
                    money: r.money,
                    t: r.type
                }
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
	    	if(err){return utils.send(msg, res, {code: Code.FAIL, err:err});}
	    	var ci = getCi(r.astrology);
            utils.send(msg, res, {
	    		code: Code.OK,
	    		data: {
                    ci: ci,
                    bi: r.astrology.items,
                    f: r.isFull
                }
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
            var ci = getCi(r.astrology);
            utils.send(msg, res, {
        		code: Code.OK,
        		data: {
                    ci: ci,
                    yl: r.astrology.integral,
                    gc: r.gold
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
    if(index == null){
        utils.send(msg, res, {code: Code.FAIL, err: "param error"});return;
    }
    var Key = picecBoxName(session);
    //userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key = picecBoxName(session);
        astrologyDao.exchange(msg, null, function(err, r) {
            if(err){utils.send(msg, res, {code: Code.FAIL,err: err});return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    bi: r.astrology.items,
                    yl: r.astrology.integral
                }
            })
        });
    //});
}

astrology.merger = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key = picecBoxName(session);
        astrologyDao.merger(msg, player, function(err, r) {
            if(err){return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    bi: r.astrology.items
                }
            });
        });
    });
}
astrology.onceMerger = function(req, res) {
    var msg = req.query;
    if(!msg.main) {
        return utils.send(msg , res, {code: Code.FAIL, err: "not main"});
    }
    if(!msg.index) {
        return utils.send(msg, res, {code: Code.FAIL, err: "not index"});
    }
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    console.log(playerId);
    var partnerId = msg.playerId;
    var characterId = utils.getRealCharacterId(playerId);
     userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key = picecBoxName(session);
        astrologyDao.onceMerger(msg, player, function(err, result) {
            if(err) {return utils.send(msg, res, {code: Code.FAIL, err: err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    bi: result.astrology.items
                }
            })
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
var partnerUtil = require("../app/utils/partnerUtil");
var dbUtil = require("../app/utils/dbUtil");
astrology.load = function(req, res) {
    var msg = req.query;
    var index = msg.index;
    console.log(index === null);
    if(index === null) {
        return  utils.send(msg, res, {code: Code.FAIL, err:"not index"});
    }
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    console.log(playerId);
    var partnerId = msg.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        var character, Key;
        if(partnerId && playerId != partnerId) {
            character = partnerUtil.getPartner(partnerId, player);
            _partnerId = utils.getRealPartnerId(partnerId);
            Key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, _partnerId);
        }else {
            character = player;
            Key = picecBoxName(session);
        }
        msg.Key = picecBoxName(session);
        msg.PKey = Key;
        if(!character) {
            return utils.send(msg, res ,{
                code: Code.FAIL,
                err: "not player"
            });
        }
        console.log("Key:",Key);
        astrologyDao.load(msg, character, function(err, result) {
            if(err){return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    ZX: result.ZX,
                    bi: result.astrology.items
                }
            });
        });
    });
} 
astrology.unLoad = function(req, res) {
    var msg = req.query;
    var index = msg.index;
    console.log(index === null);
    if(index === null) {
        return  utils.send(msg, res, {code: Code.FAIL, err:"not index" });
    }
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var partnerId = msg.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        var character, Key;
        if(partnerId && playerId != partnerId) {
            character = partnerUtil.getPartner(partnerId, player);
            _partnerId = utils.getRealPartnerId(partnerId);
            Key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, _partnerId);
        }else {
            character = player;
            Key = picecBoxName(session);
        }
        msg.Key = picecBoxName(session);
        msg.PKey = Key;
        if(!character) {
            return utils.send(msg, res ,{
                code: Code.FAIL,
                err: "not player"
            });
        }
        console.log("Key:",Key);
        astrologyDao.unLoad(msg, character, function(err, result) {
            if(err){return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: {
                    bi: result.astrology.items,
                    ZX: result.ZX
                }
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

astrology.gmRepair = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var partnerId = msg.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key = picecBoxName(session);
        astrologyDao.gmRepair(msg, player, function(err, r) {
            utils.send(msg, res, {
                err: err,
                r: r
            });
        });
    });
}