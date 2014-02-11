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

var altarService = module.exports;

altarService.extraction = function(array, character, cb) {

}

altarService.getUpdateArray = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var altar = player.altar;

    array.push(["hset", key, "altar", JSON.stringify(altar)]);
}