/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-26
 * Description: area
 */
var dataApi = require('../../utils/dataApi');
var PackageType = require('../../consts/consts').PackageType;
var consts = require('../../consts/consts');
var areaService = require('../../services/areaService');

var exp = module.exports;

exp.addPlayer = function() {

}

exp.getAreaInfo = function(player, cb) {
    areaService.getAreaInfo(player, cb);
}

exp.getAreaPlayers = function(sceneId, cb) {
    areaService.getAreaPlayers(sceneId, cb);
}

exp.addEntity = function(player, cb) {
    areaService.addEntity(player, cb);
}

exp.removePlayer = function(player, cb) {
    areaService.removePlayer(player, cb);
}