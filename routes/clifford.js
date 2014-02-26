var casinoService = require('../app/services/casinoService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var dataApi = require('../app/utils/dataApi');
var cliffordDao = require("../app/dao/cliffordDao");


function picecBoxName(session) {
    var playerId = session.playerId
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var characterId = utils.getRealCharacterId(playerId);
    return 'S'+serverId+'_T'+ registerType+'_'+ loginName+'_C'+ characterId;

}

exports.do = function(req, res) {
	var msg = req.query;
    if(msg.index == null || typeof cliffordDao["do"+msg.index] != "function") {
        return utils.send(msg, res, {code: Code.FAIL, err: "not index"});
    }
   var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
        var playerId = session.playerId;
        var characterId = utils.getRealCharacterId(playerId);
    msg.serverId  = serverId;msg.registerType = registerType; msg.loginName = loginName;msg.characterId = characterId;msg.characterId = characterId;
    msg.Key = picecBoxName(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
	   cliffordDao["do"+msg.index](msg, player, function(err, result) {
    		if(err) {	return utils.send(msg ,res, {code: Code.FAIL, err:err});}
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
    msg.serverId  = serverId;msg.registerType = registerType; msg.loginName = loginName;msg.characterId = characterId;msg.characterId = characterId;
    msg.Key = picecBoxName(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        cliffordDao.gmAdd(msg, player, function(err, result) {
            if(err) {return utils.send(msg, res, err);}
            utils.send(msg, res, result);
        });
    });
}
exports.test = function(req, res) {
	var msg = req.query;
	var session = req.session;
	var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
        var playerId = session.playerId;
        var characterId = utils.getRealCharacterId(playerId);
    msg.serverId  = serverId;msg.registerType = registerType; msg.loginName = loginName;msg.characterId = characterId;msg.characterId = characterId;
    msg.Key = picecBoxName(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
    	cliffordDao.test(msg, player, function(err, result) {
            if(err) {return utils.send(msg, res, err);}
            utils.send(msg, res, result);
        });
    });
}