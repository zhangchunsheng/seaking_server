/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: messageService
 */
var messageDao = require('../dao/messageDao');

var messageService = module.exports;

messageService.addMessage = function(serverId, registerType, loginName, characterId, message, cb) {
    messageDao.addMessage(serverId, registerType, loginName, characterId, message, cb);
}

messageService.getMessage = function(serverId, registerType, loginName, characterId, cb) {
    messageDao.getMessage(serverId, registerType, loginName, characterId, cb);
}

messageService.pushMessage = function(serverId, registerType, loginName, message, characterId, cb) {
    messageDao.pushMessage(serverId, registerType, loginName, message, characterId, cb);
}

messageService.removeMessage = function(serverId, registerType, loginName, characterId, cb) {
    messageDao.removeMessage(serverId, registerType, loginName, characterId, cb);
}

messageService.addTipMessage = function(serverId, registerType, loginName, characterId, message, cb) {
    messageDao.addTipMessage(serverId, registerType, loginName, characterId, message, cb);
}

messageService.getTipMessage = function(serverId, registerType, loginName, characterId, cb) {
    messageDao.getTipMessage(serverId, registerType, loginName, characterId, cb);
}

messageService.removeTipMessage = function(serverId, registerType, loginName, characterId, cb) {
    messageDao.removeTipMessage(serverId, registerType, loginName, characterId, cb);
}

messageService.addBattleReport = function(serverId, registerType, loginName, characterId, battleReport, cb) {
    messageDao.addBattleReport(serverId, registerType, loginName, characterId, battleReport, cb);
}

messageService.getBattleReport = function(serverId, registerType, loginName, characterId, cb) {
    messageDao.getBattleReport(serverId, registerType, loginName, characterId, cb);
}

messageService.removeBattleReport = function(serverId, registerType, loginName, characterId, cb) {
    messageDao.removeBattleReport(serverId, registerType, loginName, characterId, cb);
}

messageService.publishMessage = function(message, cb) {
    messageDao.publishMessage(message, cb);
}

messageService.addBothBattleReport = function(character, opponent, owner_battleReport, opponent_battleReport, cb) {
    messageDao.addBothBattleReport(character, opponent, owner_battleReport, opponent_battleReport, cb);
}