/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: messageService
 */
var messageDao = require('../dao/messageDao');
var PushMessage = require('../domain/message/pushMessage');

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

messageService.updatePushMessage = function(array, player, key, message) {
    var field = "pushMessage";
    var pushMessage = player.pushMessageEntity.pushMessage;
    var flag = false;
    var date = new Date();
    for(var i = 0 ; i < pushMessage.length ; i++) {
        if(pushMessage[i].type == message.type) {
            flag = true;
            if(message.num == 0) {
                //pushMessage.splice(i, 1);
                pushMessage[i].num = message.num;
                pushMessage[i].message = message.message;
                pushMessage[i].pushDate = date.getTime();
            } else {
                pushMessage[i].num = message.num;
                pushMessage[i].message = message.message;
                pushMessage[i].pushDate = date.getTime();
            }
        }
    }
    if(!flag) {
        if(message.num != 0) {
            pushMessage.push({
                type: message.type,
                message: message.message,
                num: message.num,
                date: date.getTime(),
                pushDate: date.getTime()
            });
        }
    }
    var value = JSON.stringify(pushMessage);
    array.push(["hset", key, field, value]);
    return array;
}

messageService.createNewPushMessage = function(pushMessageInfo, serverId, registerType, loginName, characterId, character) {
    pushMessageInfo.serverId = serverId;
    pushMessageInfo.registerType = registerType;
    pushMessageInfo.loginName = loginName;
    pushMessageInfo.characterId = characterId;
    pushMessageInfo.cId = character.cId;
    pushMessageInfo.pushMessage = character.pushMessage;
    var pushMessage = new PushMessage(pushMessageInfo);
    return pushMessage;
}