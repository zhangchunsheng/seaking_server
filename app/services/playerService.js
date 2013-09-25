/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var playerDao = require('../dao/playerDao');

var playerService = module.exports;

playerService.enterScene = function() {

}

playerService.enterIndu = function() {

}

playerService.leaveIndu = function() {

}

playerService.getPartner = function() {

}

playerService.changeView = function() {

}

playerService.changeArea = function() {

}

playerService.npcTalk = function() {

}

playerService.learnSkill = function() {

}

playerService.upgradeSkill = function() {

}

playerService.useSkill = function(skillId) {

}

playerService.updatePlayerHP = function(character, players, cb) {
    playerDao.updatePlayerHP(character, players, cb);
}

playerService.changeFormation = function(player, cb) {
    playerDao.changeFormation(player, cb);
}