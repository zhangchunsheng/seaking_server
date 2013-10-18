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
    if(!formation && Object.prototype.toString.call(formation) !== '[object Array]') {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //需要验证是否有该角色存在
        player.formation = JSON.parse(formation);
        playerService.changeFormation(player, function(err, reply) {
            var status = {
                code: consts.MESSAGE.RES
            };

            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = status;
            utils.send(msg, res, data);
        });
    });
}