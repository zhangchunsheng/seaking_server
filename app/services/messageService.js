/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: messageService
 */
var messageDao = require('../dao/messageDao');

var messageService = module.exports;

messageService.addMessage = function(serverId, registerType, loginName, message, cb) {
    messageDao.addMessage(serverId, registerType, loginName, message, cb);
}

messageService.getMessage = function(serverId, registerType, loginName, cb) {
    messageDao.getMessage(serverId, registerType, loginName, cb);
}

messageService.pushMessage = function(serverId, registerType, loginName, message, cb) {
    messageDao.pushMessage(serverId, registerType, loginName, message, cb);
}

messageService.removeMessage = function(serverId, registerType, loginName, cb) {
    messageDao.removeMessage(serverId, registerType, loginName, cb);
}

messageService.addTipMessage = function(serverId, registerType, loginName, message, cb) {
    messageDao.addTipMessage(serverId, registerType, loginName, message, cb);
}

messageService.getTipMessage = function(serverId, registerType, loginName, cb) {
    messageDao.getTipMessage(serverId, registerType, loginName, cb);
}

messageService.removeTipMessage = function(serverId, registerType, loginName, cb) {
    messageDao.removeTipMessage(serverId, registerType, loginName, cb);
}

messageService.addBattleReport = function(serverId, registerType, loginName, cb) {
    messageDao.addBattleReport(serverId, registerType, loginName, cb);
}

messageService.getBattleReport = function(serverId, registerType, loginName, cb) {
    messageDao.getBattleReport(serverId, registerType, loginName, cb);
}

messageService.removeBattleReport = function(serverId, registerType, loginName, cb) {
    messageDao.removeBattleReport(serverId, registerType, loginName, cb);
}

messageService.publishMessage = function(message, cb) {
    messageDao.publishMessage(message, cb);
}