/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: player
 */
var playerService = require('../app/services/playerService');
var userService = require('../app/services/userService');
var partnerService = require('../app/services/partnerService');
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var EntityType = require('../app/consts/consts').EntityType;
var dataApi = require('../app/utils/dataApi');
var area = require('../app/domain/area/area');
var world = require('../app/domain/world');
var async = require('async');

/**
 * 获得伙伴信息
 * @param req
 * @param res
 */
exports.getPartner = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , cId = msg.cId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var partners = player.partners;
        var flag = false;
        for(var i = 0 ; i < partners.length ; i++) {
            if(partners[i].cId == cId) {
                flag = true;
                break;
            }
        }
        if(flag) {
            data = {
                code: 102
            };
            utils.send(msg, res, data);
            return;
        }
        partnerService.createPartner(serverId, uid, registerType, loginName, characterId, cId, function(err, partner) {
            if(err) {
                data = {
                    code: consts.MESSAGE.ERR
                };
                utils.send(msg, res, data);
                return;
            }

            player.partners.push(partner);

            data = {
                code: consts.MESSAGE.RES,
                partner: partner
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 出场
 */
exports.gotoStage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , cId = msg.cId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var partners = player.partners;
        var flag = false;
        for(var i = 0 ; i < partners.length ; i++) {
            if(partners[i].cId == cId) {
                flag = true;
                break;
            }
        }
        if(flag) {
            data = {
                code: 102
            };
            utils.send(msg, res, data);
            return;
        }
        partnerService.createPartner(serverId, uid, registerType, loginName, characterId, cId, function(err, partner) {
            if(err) {
                data = {
                    code: consts.MESSAGE.ERR
                };
                utils.send(msg, res, data);
                return;
            }

            player.partners.push(partner);

            data = {
                code: consts.MESSAGE.RES,
                partner: partner
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 离开队伍
 */
exports.leaveTeam = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , cId = msg.cId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var partners = player.partners;
        var flag = false;
        for(var i = 0 ; i < partners.length ; i++) {
            if(partners[i].cId == cId) {
                flag = true;
                break;
            }
        }
        if(flag) {
            data = {
                code: 102
            };
            utils.send(msg, res, data);
            return;
        }
        partnerService.createPartner(serverId, uid, registerType, loginName, characterId, cId, function(err, partner) {
            if(err) {
                data = {
                    code: consts.MESSAGE.ERR
                };
                utils.send(msg, res, data);
                return;
            }

            player.partners.push(partner);

            data = {
                code: consts.MESSAGE.RES,
                partner: partner
            };
            utils.send(msg, res, data);
        });
    });
}