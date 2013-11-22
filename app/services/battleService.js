/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var dbUtil = require('../utils/dbUtil');
var battleDao = require('../dao/battleDao');

var battleService = module.exports;

battleService.battle = function() {

}

battleService.savePlayerBattleData = function(player, owners, monsters, battleData, cb) {
    battleDao.savePlayerBattleData(player, owners, monsters, battleData, cb);
}

battleService.savePlayerPKData = function(player, owners, monsters, battleData, cb) {
    battleDao.savePlayerPKData(player, owners, monsters, battleData, cb);
}

battleService.getRemoveLogDataArray = function(array, serverId, battleId) {
    var key = dbUtil.getBattleLogKey(serverId);
    array.push(["hdel", key, battleId]);
}

battleService.getBattleData = function(serverId, battleId, cb) {
    battleDao.getBattleData(serverId, battleId, cb);
}