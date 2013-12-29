/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-29
 * Description: miscsService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var dataApi = require('../../utils/dataApi');
var redisService = require('../redisService');
var Miscs = require('../../domain/attribute/miscs');

var miscsService = module.exports;

miscsService.createNewMiscs = function(miscsInfo, serverId, registerType, loginName, characterId, character) {
    miscsInfo.serverId = serverId;
    miscsInfo.registerType = registerType;
    miscsInfo.loginName = loginName;
    miscsInfo.characterId = characterId;
    miscsInfo.cId = character.cId;
    var miscs = new Miscs(miscsInfo);
    return miscs;
}