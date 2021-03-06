/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var roleDao = require('../dao/roleDao');

var roleService = module.exports;

roleService.createMainPlayer = function() {

}

/**
 * 昵称是否存在
 * @param serverId
 * @param nickname
 * @param next
 */
roleService.is_exists_nickname = function(serverId, nickname, next) {
    roleDao.is_exists_nickname(serverId, nickname, next);
}

roleService.initNickname = function(serverId, next) {
    roleDao.initNickname(serverId, next);
}

roleService.getNickname = function(serverId, next) {
    roleDao.getNickname(serverId, next);
}

roleService.removeMainPlayer = function(serverId, registerType, loginName, next) {
    roleDao.removeMainPlayer(serverId, registerType, loginName, next);
}