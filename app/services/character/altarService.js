/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-02-11
 * Description: altarService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var redisService = require('../redisService');
var altarDao = require('../../dao/character/altarDao');
var Altar = require('../../domain/attribute/altar');

var altarService = module.exports;

altarService.extraction = function(array, character, cb) {

}

altarService.getUpdateArray = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var altar = player.altar;

    array.push(["hset", key, "altar", JSON.stringify(altar)]);
}

altarService.createNewAltar = function(altarInfo, serverId, registerType, loginName, characterId, character) {
    altarInfo.serverId = serverId;
    altarInfo.registerType = registerType;
    altarInfo.loginName = loginName;
    altarInfo.characterId = characterId;
    altarInfo.cId = character.cId;
    altarInfo.loyalty = character.altar.loyalty;
    altarInfo.extractionTimes = character.altar.extractionTimes;
    var altar = new Altar(altarInfo);
    return altar;
}