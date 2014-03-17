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
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var areaService = require('../app/services/areaService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var areaUtil = require('../app/utils/areaUtil');
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
                code: consts.MESSAGE.ERR
            };
            utils.send(msg, res, data);

            return;
        }

        player.x = 100;
        player.y = 100;

        area.getAreaInfo(player, function(err, results) {
            area.addEntity(player, function(err, reply) {
                var data = {
                    code: consts.MESSAGE.RES,
                    entities: results
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.changeAndGetSceneData = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var areaId = msg.currentScene;
    var target = msg.target;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        if(err || !player) {
            console.log('Get user for userDao failed! ' + err.stack);
            data = {
                code: consts.MESSAGE.ERR
            };
            utils.send(msg, res, data);

            return;
        }

        /*if(areaId != player.currentScene) {
            data = {
                code: Code.AREA.WRONG_CURRENTSCENE
            };
            utils.send(msg, res, data);

            return;
        }*/

        var cityInfo = dataApi.city.findById(target);
        if(typeof cityInfo == "undefined") {
            data = {
                code: Code.AREA.WRONG_AREA
            };
            utils.send(msg, res, data);

            return;
        }

        //area.getAreaInfo(player, function(err, results) {
        area.getAreaPlayers(target, function(err, results) {
            if (err) {
                data = {
                    code: consts.MESSAGE.ERR
                };
                utils.send(msg, res, data);

                return;
            }

            var entities = [];
            var pageInfo = {
                currentPage: 1,
                perPage: 20
            };
            //entities = areaUtil.getEntities(target, results, player);
            //areaService.getEntities(target, results, player, function(err, entities) {
            areaService.getCurrentPageEntities(target, results, player, pageInfo, function(err, entities) {
                areaId = player.currentScene;
                if(areaId == target || target == "") {
                    data = {
                        code: consts.MESSAGE.RES,
                        currentScene: areaId,
                        pageInfo: entities.pageInfo,
                        entities: entities.currentEntities
                    };
                    utils.send(msg, res, data);
                } else {
                    player.x = 100;
                    player.y = 100;
                    player.currentScene = target;
                    world.removeAndUpdatePlayer(areaId, player, function(err) {
                        if(err) {
                            data = {
                                code: consts.MESSAGE.RES,
                                currentScene: areaId,
                                pageInfo: entities.pageInfo,
                                entities: entities.currentEntities
                            };
                        } else {
                            data = {
                                code: consts.MESSAGE.RES,
                                currentScene: target,
                                pageInfo: entities.pageInfo,
                                entities: entities.currentEntities
                            };
                        }
                        utils.send(msg, res, data);
                    });
                }
            });
        });
    });
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
            if(err) {
                data = {
                    code: Code.INDU.WRONG_INDU
                };
                utils.send(msg, res, data);
                return;
            }
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
            utils.additionalData(data, player);
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
 * getPlayerInfo
 * @param req
 * @param res
 */
exports.getPlayerInfo = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , playerId = msg.playerId;

    var data = {};
    if(utils.empty(playerId)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getPlayerById(playerId, function(err, reply) {
        if(err) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }
        var currentSkills =JSON.parse(JSON.stringify(reply.currentSkills));
        delete currentSkills.serverId;delete currentSkills.registerType;delete  currentSkills.loginName;delete  currentSkills.characterId;delete  currentSkills.allSkills;
        for(var i in currentSkills) {
            if( currentSkills[i].skillId == 0 ) {
                delete currentSkills[i];
            }
        }
        var  properties = {
            hp : reply.hp || 0,
            attack: reply.attack || 0,
            defense: reply.defense || 0,
            sunderArmor: reply.sunderArmor || 0,
            speed: reply.speed || 0,
            criticalHit : reply.criticalHit || 0,
            block: reply.block || 0,
            dodge: reply.dodge || 0,
            counter: reply.counter || 0
        }
        var combat = Math.floor ( properties.hp * (1+ (properties.dodge/5) +(properties.block/8) ) + properties.attack * (5+properties.criticalHit +properties.counter)+properties.defense+2.5*properties.sunderArmor+properties.speed );
        data = {
            code: Code.OK,
            data : [
                {
                    properties: properties,
                    currentSkills: currentSkills,
                    combat: combat
                }
            ]
        };
        utils.send(msg, res, data);
    });
}