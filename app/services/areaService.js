/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-24
 * Description: areaService
 */
var areaDao = require('../dao/areaDao');

var areaService = module.exports;

areaService.getAreaInfo = function(player, cb) {
    if(typeof player == "string") {
        areaDao.getAreaInfo({
            currentScene: player
        }, cb);
    } else {
        areaDao.getAreaInfo(player, cb);
    }
}

areaService.getAreaPlayers = function(sceneId, cb) {
    areaDao.getAreaPlayers(sceneId, cb);
}

areaService.addEntity = function(player, cb) {
    areaDao.addEntity(player, cb);
}

areaService.removePlayer = function(player, cb) {
    areaDao.removePlayer(player, cb);
}

areaService.removeAndUpdatePlayer = function(areaId, player, cb) {
    areaDao.removeAndUpdatePlayer(areaId, player, cb);
}