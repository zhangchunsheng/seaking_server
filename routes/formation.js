/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: formation
 */
var formationService = require('../app/services/formationService');
var userService = require('../app/services/userService');
var playerService = require('../app/services/playerService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 更改阵型
 * @param req
 * @param res
 */
exports.change = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , formation = msg.formation;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    if(!formation) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    try {
        formation = JSON.parse(formation);
    } catch(e) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //验证formation
        var result = player.formationEntity.checkFormation(player, formation);
        if(result == 0) {
            data = {
                code: consts.MESSAGE.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }

        var array = [];
        formationService.changeFormation(array, player, formation, function(err, reply) {
            var status = {
                code: consts.MESSAGE.RES
            };

            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = status;
            utils.send(msg, res, data);
        });
    });
}

/**
 * 默认阵型
 * @param req
 * @param res
 */
exports.setDefault = function(req, res) {

}

/**
 * 最强攻击阵型
 * @param req
 * @param res
 */
exports.forteAttack = function(req, res) {

}

/**
 * 最强防御阵型
 * @param req
 * @param res
 */
exports.forteDefense = function(req, res) {

}

/**
 * 设置阵法
 * @param req
 * @param res
 */
exports.setTactical = function(req, res) {

}

/**
 * 升级阵法
 * @param req
 * @param res
 */
exports.upgrade = function(req, res) {

}