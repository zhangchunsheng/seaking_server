/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: roleHandler
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var userDao = require('../../../dao/userDao');
var equipDao = require('../../../dao/equipmentsDao');
var packageDao = require('../../../dao/packageDao');
var consts = require('../../../consts/consts');
var channelUtil = require('../../../util/channelUtil');
var async = require('async');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

/**
 *
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.createMainPlayer = function(msg, session, next) {
    var uid = session.uid
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , cId = msg.cId // cId characterId
        , nickname = msg.nickname
        , isRandom = msg.isRandom;// 随机获得昵称
    var self = this;

    logger.info(session);
    var serverId = 1;

    userDao.is_exists_nickname(this.app, serverId, nickname, function(err, flag) {
        if (flag) {
            next(null, {code: consts.MESSAGE.ERR});
            return;
        }

        userDao.createCharacter(serverId, uid, registerType, loginName, cId, nickname, function(err, character) {
            if(err) {
                logger.error('[register] fail to invoke createPlayer for ' + err.stack);
                next(null, {code: consts.MESSAGE.ERR, error:err});
                return;
            } else {
                var array = [
                    function(callback) {// 初始化武器
                        equipDao.createEquipments(character.id, callback);
                    },
                    function(callback) {// 初始化装备
                        packageDao.createPackage(character.id, callback);
                    },
                    function(callback) {
                        character.learnSkill(1, callback);
                    }
                ];
                async.parallel([],
                    function(err, results) {
                        if (err) {
                            logger.error('learn skill error with player: ' + JSON.stringify(character.strip()) + ' stack: ' + err.stack);
                            next(null, {code: consts.MESSAGE.ERR, error:err});
                            return;
                        }
                        afterLogin(self.app, msg, session, {id: uid}, character.strip(), next);
                    });
            }
        });
    });
};

var afterLogin = function (app, msg, session, user, character, next) {
    async.waterfall([
        function(cb) {
            session.bind(user.id, cb);
        },
        function(cb) {
            session.set('loginName', user.loginName);
            session.set('areaId', character.areaId);
            session.set('nickname', character.nickname);
            session.set('playerId', character.playerId);
            session.on('closed', onUserLeave);
            session.pushAll(cb);
        },
        function(cb) {
            app.rpc.chat.chatRemote.add(session, user.id, character.nickname, channelUtil.getGlobalChannelName(), cb);
        }
    ],
    function(err) {
        if(err) {
            logger.error('fail to select character, ' + err.stack);
            next(null, {code: consts.MESSAGE.ERR});
            return;
        }
        next(null, {code: consts.MESSAGE.RES, user: user, player: character});
    });
};

var onUserLeave = function (session, reason) {
    if(!session || !session.uid) {
        return;
    }

    var rpc = pomelo.app.rpc;
    rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), areaId: session.get('areaId')}, null);
    rpc.chat.chatRemote.kick(session, session.uid, null);
};