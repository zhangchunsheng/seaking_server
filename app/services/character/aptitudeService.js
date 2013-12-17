/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-10
 * Description: aptitudeService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var redisService = require('../redisService');
var aptitudeDao = require('../../dao/character/aptitudeDao');
var Aptitude = require('../../domain/attribute/aptitude');

var aptitudeService = module.exports;

aptitudeService.upgrade = function(array, player, type, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    var field = "aptitude";
    var aptitude = player.aptitude;
    var value = JSON.stringify(aptitude);
    array.push(["hset", key, field, value]);
    array.push(["hset", key, "money", player.money]);
    array.push(["hset", key, "gameCurrency", player.gameCurrency]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, aptitude[type].level);
    });
}

aptitudeService.createNewAptitude = function(aptitudeInfo, serverId, registerType, loginName, characterId) {
    aptitudeInfo.serverId = serverId;
    aptitudeInfo.registerType = registerType;
    aptitudeInfo.loginName = loginName;
    aptitudeInfo.characterId = characterId;
    var aptitude = new Aptitude(aptitudeInfo);
    return aptitude;
}