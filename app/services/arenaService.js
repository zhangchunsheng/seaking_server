/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var arenaDao = require('../dao/arenaDao');

var arenaService = module.exports;

arenaService.pk = function() {

}

arenaService.add = function(player, cb) {
    arenaDao.add(player, cb);
}

arenaService.getOpponents = function(player, cb) {
    arenaDao.getOpponents(player, cb);
}

arenaService.getRank = function(player, cb) {
    arenaDao.getRank(player, cb);
}

arenaService.exchange = function(player, opponent, cb) {
    arenaDao.exchange(player, opponent, cb)
}