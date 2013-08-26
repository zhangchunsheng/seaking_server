/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: playerHandler
 */
/**
 * Module dependencies
 */

var area = require('../../../domain/area/area');
var messageService = require('../../../domain/messageService');
var timer = require('../../../domain/area/timer');
var world = require('../../../domain/world');
var userDao = require('../../../dao/userDao');
var partnerDao = require('../../../dao/partnerDao');
var actionManager = require('../../../domain/action/actionManager');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var dataApi = require('../../../util/dataApi');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);

var handler = module.exports;

/**
 * 进入场景
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.enterScene = function(msg, session, next) {
    var playerId = session.get('playerId');
    var areaId = session.get('areaId');
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName");
    userDao.getCharacterAllInfo(serverId, registerType, loginName, playerId, function(err, player) {
        if (err || !player) {
            logger.error('Get user for userDao failed! ' + err.stack);
            next(new Error('fail to get user from dao'), {
                route: msg.route,
                code: consts.MESSAGE.ERR
            });

            return;
        }

        player.regionId = serverId;
        player.serverId = session.frontendId;

        pomelo.app.rpc.chat.chatRemote.add(session, session.uid, player.name, channelUtil.getAreaChannelName(areaId), null);

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
        logger.info(data);
        next(null, data);

        if (!area.addEntity(player)) {
            logger.error("Add player to area faild! areaId : " + player.areaId);
        }
    }, true);
};

/**
 * 进入副本
 * @param msg
 * @param session
 * @param next
 */
handler.enterIndu = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , induId = msg.induId;
    var player = area.getPlayer(session.get('playerId'));
    logger.info(player);
    player.isEnterIndu = 1;
    userDao.enterIndu(serverId, registerType, loginName, induId, function(err, induInfo) {
        player.currentIndu = induInfo;
        next(null, {
            code: consts.MESSAGE.RES,
            induInfo: induInfo
        });
    });
}

/**
 * 离开副本
 * @param msg
 * @param session
 * @param next
 */
handler.leaveIndu = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , induId = msg.induId;
    var player = area.getPlayer(session.get('playerId'));
    logger.info(player);
    player.isEnterIndu = 0;
    userDao.leaveIndu(serverId, registerType, loginName, induId, function(err, induInfo) {
        player.currentIndu = induInfo;

        player.updateTaskRecord(consts.TaskGoalType.PASS_INDU, {
            itemId: induId
        });

        next(null, {
            code: consts.MESSAGE.RES,
            induInfo: induInfo
        });
    });
}

handler.getPartner = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , cId = msg.cId;
    var player = area.getPlayer(session.get('playerId'));
    var partners = player.partners;
    var flag = false;
    for(var i = 0 ; i < partners.length ; i++) {
        if(partners[i].cId == cId) {
            flag = true;
            break;
        }
    }
    if(flag) {
        next(null, {
            code: 102
        });
        return;
    }
    var characterId = session.get("playerId");
    characterId = userDao.getRealCharacterId(characterId);
    partnerDao.createPartner(serverId, uid, registerType, loginName, characterId, cId, function(err, partner) {
        if(err) {
            next(null, {code: consts.MESSAGE.ERR});
            return;
        }

        player.partners.push(partner);
        next(null, {code: consts.MESSAGE.RES, partner: partner});
    });
}

/**
 * Change player's view.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.changeView = function(msg, session, next){
    var playerId = session.get('playerId');
    var width = msg.width;
    var height = msg.height;

    var radius = width > height ? width : height;

    var range = Math.ceil(radius / 600);
    var player = area.getPlayer(playerId);

    if(range < 0 || !player){
        next(new Error('invalid range or player'));
        return;
    }

    if(player.range !== range) {
        timer.updateWatcher({id:player.entityId, type:player.type}, player, player, player.range, range);
        player.range = range;
    }

    next();
};

/**
 * Player moves. Player requests move with the given movePath.
 * Handle the request from client, and response result to client
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.move = function(msg, session, next) {
    var path = msg.path;
    var playerId = session.get('playerId');
    var player = area.getPlayer(playerId);
    var speed = player.walkSpeed;

    player.target = null;

    if(!area.map().verifyPath(path)){
        logger.warn('The path is illigle!! The path is: %j', msg.path);
        next(null, {
            route: msg.route,
            code: consts.MESSAGE.ERR
        });

        return;
    }

    var action = new Move({
        entity: player,
        path: path,
        speed: speed
    });

    var ignoreList = {};
    ignoreList[player.userId] = true;
    if (timer.addAction(action)) {
        player.isMoving = true;
        //Update state
        if(player.x !== path[0].x || player.y !== path[0].y) {
            timer.updateObject({id:player.entityId, type:consts.EntityType.PLAYER}, {x : player.x, y : player.y}, path[0]);
            timer.updateWatcher({id:player.entityId, type:consts.EntityType.PLAYER}, {x : player.x, y : player.y}, path[0], player.range, player.range);
        }

        messageService.pushMessageByAOI({
            route: 'onMove',
            entityId: player.entityId,
            path: path,
            speed: speed
        }, path[0], ignoreList);
        next(null, {
            route: msg.route,
            code: consts.MESSAGE.RES
        });
        next();
    }
};

//Change area
handler.changeArea = function(msg, session, next) {
    var areaId = msg.currentScene;
    var target = msg.target;

    var req = {
        areaId: areaId,
        target: target,
        uid: session.uid,
        playerId: session.get('playerId'),
        frontendId: session.frontendId
    };

    world.changeArea(req, session, function(err) {
        if(err) {
            next(null, {
                code: consts.MESSAGE.ERR,
                currentScene: target
            });
        } else {
            next(null, {
                code: consts.MESSAGE.RES,
                currentScene: target
            });
        }
    });
};

handler.npcTalk = function(msg, session, next) {
    var player = area.getPlayer(session.get('playerId'));
    player.target = msg.targetId;
    next();
};

//Player  learn skill
handler.learnSkill = function(msg, session, next) {
    var player = area.getPlayer(session.get('playerId'));
    var status = player.learnSkill(msg.skillId);

    next(null, {status: status, skill: player.fightSkills[msg.skillId]});
};

//Player upgrade skill
handler.upgradeSkill = function(msg, session, next) {
    var player = area.getPlayer(session.get('playerId'));
    var status = player.upgradeSkill(msg.skillId);

    next(null, {status: status});
};
