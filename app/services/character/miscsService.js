/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-29
 * Description: miscsService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var dataApi = require('../../utils/dataApi');
var redisService = require('../redisService');
var Miscs = require('../../domain/attribute/miscs');

var miscsService = module.exports;

miscsService.getUpdateArray = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var miscs = player.miscsEntity.miscs;
    var value = {
        miscs: miscs
    };
    array.push(["hset", key, "miscs", JSON.stringify(value)]);
}

miscsService.createNewMiscs = function(miscsInfo, serverId, registerType, loginName, characterId, character) {
    miscsInfo.serverId = serverId;
    miscsInfo.registerType = registerType;
    miscsInfo.loginName = loginName;
    miscsInfo.characterId = characterId;
    miscsInfo.cId = character.cId;
    miscsInfo.miscs = character.miscs;
    var miscs = new Miscs(miscsInfo);
    return miscs;
}