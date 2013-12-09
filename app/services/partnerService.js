/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var redisService = require('./redisService');
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

partnerService.getPartnerId = function(array) {

}

partnerService.updatePartners = function(array) {

}

partnerService.addHP = function(array) {

}

partnerService.updatePartners = function(array) {

}

partnerService.gotoStage = function(array, player, showCIds, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    var field = "showCIds";
    var value = JSON.stringify(showCIds);
    array.push(["hset", key, field, value]);
    redisService.setData(array, cb);
}

partnerService.leaveTeam = function(array, player, cId, cb) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    var partners = player.partners;
    var allPartners = player.allPartners;
    var field = "partners";
    for(var i = 0 ; i < partners.length ; i++) {
        if(partners[i].cId == cId) {
            partners.splice(i, 1);
            break;
        }
    }
    var obj = {
        partners: partners,
        allPartners: allPartners
    };
    var value = JSON.stringify(obj);
    array.push(["hset", key, field, value]);
    redisService.setData(array, cb);
}