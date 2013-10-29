/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: message
 */
var arenaService = require('../app/services/arenaService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var session = require('../app/http/session');
var region = require('../config/region');
var EntityType = require('../app/consts/consts').EntityType;
var Fight = require('../app/domain/battle/fight');
var FightTeam = require('../app/domain/battle/fightTeam');
var consts = require('../app/consts/consts');
var arenaDao = require('../app/dao/arenaDao');

exports.index = function(req, res) {
    res.send("index");
}

/**
 *
 * @param req
 * @param res
 */
exports.addMessage = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.getMessage = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.getBattleReport = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.removeBattleReport = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.removeMessage = function(req, res) {

}