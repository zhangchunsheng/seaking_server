/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var packageDao = require('../dao/packageDao');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');

var packageService = module.exports;

packageService.addItem = function() {

}

packageService.dropItem = function() {

}

packageService.sellItem = function() {

}

packageService.discardItem = function() {

}

packageService.resetItem = function() {

}

packageService.userItem = function() {

}

packageService.createPackage = function(playerId, callback) {
    utils.invokeCallback(callback, null, {});
}

packageService.update = function(val, cb) {
    packageDao.update(val, cb);
}

packageService.getUpdateArray = function(array, val) {
    var key = dbUtil.getPlayerKey(val.serverId, val.registerType, val.loginName, val.characterId);
    var value = {
        itemCount: val.itemCount,
        items:val.items
    };
    array.push(["hset", key, "package", JSON.stringify(value)]);
}