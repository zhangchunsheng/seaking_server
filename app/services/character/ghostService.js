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

var ghostService = module.exports;

ghostService.upgrade = function(array, player, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    var field = "ghost";
    var ghost = player.ghost;
    var value = JSON.stringify(ghost);
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, ghost.level);
    });
}