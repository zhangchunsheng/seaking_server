/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: player
 */
var playerService = require('../app/services/playerService');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 进入场景
 * @param req
 * @param res
 */
exports.enterScene = function(req, res) {
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
}

/**
 * 进入副本
 * @param req
 * @param res
 */
exports.enterIndu = function(req, res) {
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
 * @param req
 * @param res
 */
exports.leaveIndu = function(req, res) {
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

/**
 * 获得伙伴信息
 * @param req
 * @param res
 */
exports.getPartner = function(req, res) {
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
 * changeView
 * @param req
 * @param res
 */
exports.changeView = function(req, res) {
    res.send("changeView");
}

/**
 * 切换场景
 * @param req
 * @param res
 */
exports.changeArea = function(req, res) {
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
}

/**
 * npcTalk
 * @param req
 * @param res
 */
exports.npcTalk = function(req, res) {
    var player = area.getPlayer(session.get('playerId'));
    player.target = msg.targetId;
    next();
}

/**
 * 学习技能
 * @param req
 * @param res
 */
exports.learnSkill = function(req, res) {
    var player = area.getPlayer(session.get('playerId'));
    var status = player.learnSkill(msg.skillId);

    next(null, {status: status, skill: player.fightSkills[msg.skillId]});
}

/**
 * 升级技能
 * @param req
 * @param res
 */
exports.upgradeSkill = function(req, res) {
    var player = area.getPlayer(session.get('playerId'));
    var status = player.upgradeSkill(msg.skillId);

    next(null, {status: status});
}