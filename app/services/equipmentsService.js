/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var equipmentsDao = require('../dao/equipmentsDao');
var utils = require('../utils/utils');

var equipmentsService = module.exports;

equipmentsService.wearWeapon = function() {

}

equipmentsService.unWearWeapon = function() {

}

equipmentsService.equip = function() {

}

equipmentsService.unEquip = function() {

}

equipmentsService.upgrade = function() {

}

equipmentsService.createEquipments = function(playerId, callback) {
    utils.invokeCallback(callback, null, {});
}

equipmentsService.update = function(val, cb) {
    equipmentsDao.update(val, cb);
}