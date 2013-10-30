/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: messageService
 */
var messageDao = require('../dao/messageDao');

var messageService = module.exports;

messageService.getMessage = function(serverId, registerType, loginName, cb) {
    messageDao.getMessage(serverId, registerType, loginName, cb);
}

messageService.pushMessage = function(serverId, registerType, loginName, message, cb) {
    messageDao.pushMessage(serverId, registerType, loginName, message, cb);
}

messageService.removeMessage = function(serverId, registerType, loginName, cb) {
    messageDao.removeMessage(serverId, registerType, loginName, cb);
}

messageService.publishMessage = function(message, cb) {
    messageDao.publishMessage(message, cb);
}