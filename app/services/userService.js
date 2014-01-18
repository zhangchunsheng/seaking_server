/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: userService
 */
var userDao = require('../dao/userDao');
var utils = require('../utils/utils');
var eventManager = require('../domain/event/eventManager');

var userService = module.exports;

userService.get = function() {

}

userService.createCharacter = function(serverId, userId, registerType, loginName, cId, nickname, isRandom, cb) {
    userDao.createCharacter(serverId, userId, registerType, loginName, cId, nickname, isRandom, cb);
}

userService.getCharactersByLoginName = function(serverId, registerType, loginName, cb) {
    userDao.getCharactersByLoginName(serverId, registerType, loginName, cb);
}

userService.getCharacterAllInfo = function(serverId, registerType, loginName, characterId, cb) {
    userDao.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, character) {
        if(!!err || !character) {
            console.log('Get user for userService failed! ' + err);
        } else {
            eventManager.addEvent(character);
        }
        utils.invokeCallback(cb, err, character);
    });
}

userService.getUserByLoginName = function(serverId, registerType, loginName, cb) {
    userDao.getUserByLoginName(serverId, registerType, loginName, cb);
}

userService.updatePlayerInduInfo = function(character, eid, cb) {
    userDao.updatePlayerInduInfo(character, eid, cb);
}

userService.enterIndu = function(serverId, registerType, loginName, induId, cb) {
    userDao.enterIndu(serverId, registerType, loginName, induId, cb);
}

userService.leaveIndu = function(serverId, registerType, loginName, induId, cb) {
    userDao.leaveIndu(serverId, registerType, loginName, induId, cb);
}

userService.getPlayerById = function(playerId, cb) {
    userDao.getPlayerById(playerId, cb);
}

userService.getRealCharacterId = function(characterId) {
    userDao.getRealCharacterId(characterId);
}

userService.updatePlayer = function(player, field, cb) {
    userDao.updatePlayer(player, field, cb);
}

userService.update = function(array, cb) {
    userDao.update(array, cb);
}

userService.upgrade = function(player, columns, cb) {
    userDao.upgrade(player, columns, cb);
}

userService.updatePlayerAttribute = function(player, cb) {
    userDao.updatePlayerAttribute(player, cb);
}

userService.getUpdateArray = function(array, player, key, columns) {
    var obj = {};
    var o = "";
    for(var i = 0 ; i < columns.length ; i++) {
        obj = {};
        o = columns[i];
        if(typeof player[o] == "object") {
            if(Object.prototype.toString.call(player[o]) === '[object Array]') {
                obj[o] = player[o];
                array.push(["hset", key, o, JSON.stringify(obj)]);
            } else if(o == "skills" || o == "curTasks") {
                for(var o1 in player[o]) {
                    array.push(["hset", key, o1, JSON.stringify(player[o][o1])]);
                }
            } else {
                array.push(["hset", key, o, JSON.stringify(player[o])]);
            }
        } else {
            array.push(["hset", key, o, player[o]]);
        }
    }
    return array;
}

userService.getCharacterInfoByNickname = function(serverId, nickname, cb) {
    userDao.getCharacterInfoByNickname(serverId, nickname, cb);
}