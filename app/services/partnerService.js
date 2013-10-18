/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var partnerDao = require('../dao/partnerDao');

var partnerService = module.exports;

partnerService.getAllPartner = function() {

}

partnerService.getRealPartnerId = function() {

}

partnerService.getPartner = function() {
    partnerDao.getPartner();
}

partnerService.createPartner = function(serverId, userId, registerType, loginName, characterId, cId, cb) {
    partnerDao.createPartner(serverId, userId, registerType, loginName, characterId, cId, cb);
}

partnerService.getPartnerId = function() {

}

partnerService.updatePartners = function() {

}

partnerService.addHP = function() {

}

partnerService.updatePartners = function() {

}