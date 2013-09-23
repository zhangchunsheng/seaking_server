/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: player
 */
var playerService = require('../app/services/playerService');
var userService = require('../app/services/userService');
var partnerService = require('../app/services/partnerService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var EntityType = require('../app/consts/consts').EntityType;
var dataApi = require('../app/utils/dataApi');
var area = require('../app/domain/area/area');
var world = require('../app/domain/world');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 进入场景
 * @param req
 * @param res
 */
exports.enterScene = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var data = {};

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        if (err || !player) {
            console.log('Get user for userDao failed! ' + err.stack);
            data = {
                route: msg.route,
                code: consts.MESSAGE.ERR
            };
            utils.send(msg, res, data);

            return;
        }

        player.x = 100;
        player.y = 100;

        /*var data = {
         entities: area.getAreaInfo({x: player.x, y: player.y}, player.range),
         curPlayer: player.getInfo()
         };*/
        var data = {
            code: consts.MESSAGE.RES,
            entities: area.getAreaInfo({x: player.x, y: player.y}, player.range)
        };
        utils.send(msg, res, data);

        if (!area.addEntity(player)) {
            console.log("Add player to area faild! areaId : " + player.areaId);
        }
    }, true);
}

/**
 * 进入副本
 * @param req
 * @param res
 */
exports.enterIndu = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , induId = msg.induId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.isEnterIndu = 1;

        var data = {};
        userService.enterIndu(serverId, registerType, loginName, induId, function(err, induInfo) {
            player.currentIndu = induInfo;
            data = {
                code: consts.MESSAGE.RES,
                induInfo: induInfo
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 离开副本
 * @param req
 * @param res
 */
exports.leaveIndu = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , induId = msg.induId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.isEnterIndu = 0;
        userService.leaveIndu(serverId, registerType, loginName, induId, function(err, induInfo) {
            player.currentIndu = induInfo;

            var data = {};
            player.updateTaskRecord(consts.TaskGoalType.PASS_INDU, {
                itemId: induId
            });

            data = {
                code: consts.MESSAGE.RES,
                induInfo: induInfo
            };
            utils.send(msg, res, data);
        });
    });
}

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
        var characterId = session.get("playerId");
        characterId = userService.getRealCharacterId(characterId);
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
 * changeView
 * @param req
 * @param res
 */
exports.changeView = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("changeView");
}

/**
 * 切换场景
 * @param req
 * @param res
 */
exports.changeArea = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var areaId = msg.currentScene;
    var target = msg.target;

    var args = {
        areaId: areaId,
        target: target,
        uid: session.uid,
        serverId: session.serverId,
        registerType: session.registerType,
        loginName: session.loginName,
        playerId: session.playerId
    };

    var data = {};
    world.changeArea(args, session, function(err) {
        if(err) {
            data = {
                code: consts.MESSAGE.ERR,
                currentScene: areaId
            };
            utils.send(msg, res, data);

        } else {
            data = {
                code: consts.MESSAGE.RES,
                currentScene: target
            };
            utils.send(msg, res, data);
        }
    });
}

/**
 * npcTalk
 * @param req
 * @param res
 */
exports.npcTalk = function(req, res) {
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
        player.target = msg.targetId;
        utils.send(msg, res, data);
    });
}

/**
 * 学习技能
 * @param req
 * @param res
 */
exports.learnSkill = function(req, res) {
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
        var status = player.learnSkill(msg.skillId);

        data = {
            status: status,
            skill: player.fightSkills[msg.skillId]
        };
        utils.send(msg, res, data);
    });
}

/**
 * 升级技能
 * @param req
 * @param res
 */
exports.upgradeSkill = function(req, res) {
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
        var status = player.upgradeSkill(msg.skillId);

        data = {
            status: status
        };
        utils.send(msg, res, data);
    });
}