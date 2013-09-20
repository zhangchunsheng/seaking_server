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
var tokenService = require('../../../../../shared/token');

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
        , registerType = session.get('registerType')
        , loginName = session.get('loginName')
        , cId = msg.cId // cId characterId
        , nickname = msg.nickname
        , isRandom = msg.isRandom;// 随机获得昵称
    var self = this;

    //var res = tokenService.parse(token, "pomelo_session_secret");

    logger.info(session);
    var serverId = this.app.get("regionInfo").serverId;

    userDao.is_exists_nickname(this.app, serverId, nickname, function(err, flag) {
        if(flag) {
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
                        var skillId = 1;
                        character.learnSkill(skillId, callback);
                    }
                ];
                async.parallel(array,
                    function(err, results) {
                        if (err) {
                            logger.error('learn skill error with player: ' + JSON.stringify(character.strip()) + ' stack: ' + err.stack);
                            next(null, {code: consts.MESSAGE.ERR, error:err});
                            return;
                        }
                        afterLogin(self.app, msg, session, {id: uid}, character.getUserInfo(), next);
                    }
                );
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
            session.set('serverId', character.serverId);
            session.set('registerType', character.registerType);
            session.set('loginName', character.loginName);
            session.set('areaId', character.currentScene);
            session.set('playername', character.nickname);
            session.set('playerId', character.id);
            session.set('ip', session.__session__.__socket__.remoteAddress.ip);
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