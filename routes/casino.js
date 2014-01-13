/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: casino
 */
var casinoService = require('../app/services/casinoService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var dataApi = require('../app/utils/dataApi');
var casinoDao = require("../app/dao/casinoDao");
exports.index = function(req, res) {
    res.send("index");
}

function picecBoxName(session) {
    var playerId = session.playerId
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var characterId = utils.getRealCharacterId(playerId);
    return 'S'+serverId+'_T'+ registerType+'_'+ loginName+'_C'+ characterId;

}

var callbackGet = function(result) {
    var data = result.casino;
    console.log(result);
    var _data = JSON.parse(JSON.stringify(data));
    console.log(_data.items);
    _data.items.items.forEach(function(value) {
        if(value){
            delete value.probability;
        }
    });
    return {
       allPrice: _data.items.allPrice,
       items: _data.items.items,
       refreshNum: _data.refreshNum,
       riskNum: _data.riskNum,
       gamblingNum: _data.gamblingNum
    };
}
/**
 * 获得物品
 * @param req
 * @param res
 */
exports.get = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key =   picecBoxName(session);
        casinoDao.get(msg, player, function(err, result) {   
            if(err) {return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: callbackGet(result)
            })
        });
    });
}
var callbackRefresh = function(result) {
    var data = result.casino;
    var _data = JSON.parse(JSON.stringify(data));
    console.log(_data.items);
    _data.items.items.forEach(function(value) {
        if(value){
            delete value.probability;
        }
    });
    return {
        items: _data.items.items,
        allPrice: _data.items.allPrice,
        refreshNum: _data.refreshNum,
        riskNum: _data.riskNum,
        gamblingNum: _data.gamblingNum,
        gameCurrency: result.gameCurrency
    }
}
exports.refresh = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key =   picecBoxName(session);
        casinoDao.refresh(msg, player, function(err, result) {   
            if(err) {return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: callbackRefresh(result)
            })
        });
    });
}
/**
 * 下注
 * @param req
 * @param res
 */
//找个地方来存
var callbackGambling = function(result) {
    var data = result.casino;
    var _data = JSON.parse(JSON.stringify(data));
    console.log(_data.items);
    _data.items.items.forEach(function(value) {
        if(value){
            delete value.probability;
        }
    });
    var _items = [];
    for(var i = 0, len = _data.index; i<len;i++) {
        _items.push(_data.items.items[i]);
    }
    return {
       allPrice: _data.items.allPrice,
       items: _items,
       refreshNum: _data.refreshNum,
       riskNum: _data.riskNum,
       gamblingNum: _data.gamblingNum < 0? 0: _data.gamblingNum,
       gameCurrency : result.gold,
       result : result.result,
       changeItems: result.changeItems
    };
}
exports.gambling = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key =   picecBoxName(session);
        casinoDao.gambling(msg, player, function(err, result) {   
            if(err) {return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: callbackGambling(result)
            })
        });
    });
}

exports.gmRepair = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.Key =   picecBoxName(session);
        casinoDao.gmRepair(msg, player, function(err, result) {   
            if(err) {return utils.send(msg, res, {code: Code.FAIL, err:err});}
            utils.send(msg, res, {
                code: Code.OK,
                data: result
            })
        });
    });
}