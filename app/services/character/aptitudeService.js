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

var aptitudeService = module.exports;

aptitudeService.upgrade = function(array, player, type, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    var field = "aptitude";
    var aptitude = player.aptitude;
    console.log(aptitude);
    aptitude[type].level = parseInt(aptitude[type].level) + 1;
    var value = JSON.stringify(aptitude);
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, aptitude[type].level);
    });
}