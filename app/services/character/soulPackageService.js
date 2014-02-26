/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-02-11
 * Description: soulPackageService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var redisService = require('../redisService');
var SoulPackage = require('../../domain/attribute/soulPackage');

var soulPackageService = module.exports;

soulPackageService.getUpdateArray = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var soulPackage = player.soulPackageEntity.getInfo();
    array.push(["hset", key, "soulPackage", JSON.stringify(soulPackage)]);
}

soulPackageService.createNewSoulPackage = function(soulPackageInfo, serverId, registerType, loginName, characterId, character) {
    soulPackageInfo.serverId = serverId;
    soulPackageInfo.registerType = registerType;
    soulPackageInfo.loginName = loginName;
    soulPackageInfo.characterId = characterId;
    soulPackageInfo.cId = character.cId;
    soulPackageInfo.items = character.soulPackage.items;
    soulPackageInfo.itemCount = character.soulPackage.itemCount;
    var soulPackage = new SoulPackage(soulPackageInfo);
    return soulPackage;
}