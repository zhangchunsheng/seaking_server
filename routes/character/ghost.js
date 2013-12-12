/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: ghost
 */
var playerService = require('../../app/services/playerService');
var userService = require('../../app/services/userService');
var ghostService = require('../../app/services/character/ghostService');
var packageService = require('../../app/services/packageService');
var equipmentsService = require('../../app/services/equipmentsService');
var taskService = require('../../app/services/taskService');
var redisService = require('../../app/services/redisService');
var Code = require('../../shared/code');
var utils = require('../../app/utils/utils');
var consts = require('../../app/consts/consts');
var EntityType = require('../../app/consts/consts').EntityType;
var dataApi = require('../../app/utils/dataApi');
var area = require('../../app/domain/area/area');
var world = require('../../app/domain/world');
var async = require('async');

exports.index = function(req, res) {

}

exports.upgrade = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var array = [];

        var ghost = player.ghost;
        ghost.level = parseInt(ghost.level) + 1;
        var ghostData = dataApi.ghosts.findById(ghost.level);
        if(utils.empty(ghostData)) {
            data = {
                code: Code.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }
        if(utils.empty(ghost.number) || parseInt(ghost.number) < parseInt(ghostData.costGhostNum)) {
            data = {
                code: Code.CHARACTER.NOMORE_GHOSTNUM
            };
            utils.send(msg, res, data);
            return;
        }
        ghost.number = parseInt(ghost.number) - parseInt(ghostData.costGhostNum);
        ghostService.upgrade(array, player, function(err, reply) {
            data = {
                code: Code.OK,
                level: reply
            };
            utils.send(msg, res, data);
        });
    });
}