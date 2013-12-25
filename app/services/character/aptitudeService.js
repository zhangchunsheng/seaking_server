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

aptitudeService.upgrade = function(array, mainPlayer, player, type, cb) {
    var characterId = utils.getRealCharacterId(mainPlayer.id);
    var key = dbUtil.getPlayerKey(mainPlayer.sid, mainPlayer.registerType, mainPlayer.loginName, characterId);
    array.push(["hset", key, "money", mainPlayer.money]);
    array.push(["hset", key, "gameCurrency", mainPlayer.gameCurrency]);

    if(player.id.indexOf("P") >= 0) {
        var partnerId = utils.getRealPartnerId(player.id);
        key = dbUtil.getPartnerKey(player.sid, player.registerType, player.loginName, characterId, partnerId);
    }
    var field = "aptitude";
    var aptitude = player.aptitude;
    var value = JSON.stringify(aptitude);
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, aptitude[type].level);
    });
}

aptitudeService.createNewAptitude = function(aptitudeInfo, serverId, registerType, loginName, characterId, character) {
    aptitudeInfo.serverId = serverId;
    aptitudeInfo.registerType = registerType;
    aptitudeInfo.loginName = loginName;
    aptitudeInfo.characterId = characterId;
    aptitudeInfo.cId = character.cId;
    var aptitude = new Aptitude(aptitudeInfo);
    return aptitude;
}