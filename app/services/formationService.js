/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var dataApi = require('../utils/dataApi');
var redisService = require('./redisService');
var formationDao = require('../dao/formationDao');
var Formation = require('../domain/formation');

var formationService = module.exports;

/**
 * changeFormation
 * @param array
 * @param player
 * @param formation
 * @param cb
 */
formationService.changeFormation = function(array, player, formation, cb) {
    var new_formation = {};
    for(var i in player.formationEntity.formation.formation) {
        new_formation[i] = {};
        new_formation[i].playerId = formation[i];
    }
    player.formationEntity.formation.formation = new_formation;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, player.formationEntity.formation);
    });
}

formationService.createNewFormation = function(formationInfo, serverId, registerType, loginName, characterId, character) {
    formationInfo.serverId = serverId;
    formationInfo.registerType = registerType;
    formationInfo.loginName = loginName;
    formationInfo.characterId = characterId;
    formationInfo.cId = character.cId;
    formationInfo.formation = character.formation;
    formationInfo.tacticals = character.tacticals;
    var formation = new Formation(formationInfo);
    return formation;
}