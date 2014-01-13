/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var formationDao = require('../dao/formationDao');
var Formation = require('../domain/formation');

var formationService = module.exports;

formationService.changeFormation = function(array, player, formation, cb) {

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