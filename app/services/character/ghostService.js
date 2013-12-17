/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-10
 * Description: ghostService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var dataApi = require('../../utils/dataApi');
var redisService = require('../redisService');
var ghostDao = require('../../dao/character/ghostDao');
var Ghost = require('../../domain/attribute/ghost');

var ghostService = module.exports;

ghostService.upgrade = function(array, mainPlayer, player, cb) {
    var characterId = utils.getRealCharacterId(mainPlayer.id);
    var key = dbUtil.getPlayerKey(mainPlayer.sid, mainPlayer.registerType, mainPlayer.loginName, characterId);
    array.push(["hset", key, "ghostNum", mainPlayer.ghostNum]);

    if(player.id.indexOf("P") >= 0) {
        var partnerId = utils.getRealPartnerId(player.id);
        key = dbUtil.getPartnerKey(player.sid, player.registerType, player.loginName, characterId, partnerId);
        console.log(key);
    }
    var field = "ghost";
    var ghost = player.ghost;
    var value = JSON.stringify(ghost);
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, ghost.level);
    });
}

ghostService.createNewGhost = function(ghostInfo, serverId, registerType, loginName, characterId) {
    ghostInfo.serverId = serverId;
    ghostInfo.registerType = registerType;
    ghostInfo.loginName = loginName;
    ghostInfo.characterId = characterId;
    var ghost = new Ghost(ghostInfo);
    return ghost;
}