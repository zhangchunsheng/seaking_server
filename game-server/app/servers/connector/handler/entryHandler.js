/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: entryHandler
 */
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var async = require('async');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;

    if(!this.app)
        logger.error(app);
};

var pro = Handler.prototype;

/**
 * New client entry game server. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
pro.entry = function(msg, session, next) {
    var token = msg.token, self = this;

    var serverId = this.app.get("regionInfo").serverId;
    if(!token) {
        next(new Error('invalid entry request: empty token'), {code: Code.FAIL});
        return;
    }

    var uid, userInfo, players, player;
    async.waterfall([
        function(cb) {
            // auth token
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function(code, user, cb) {
            // query player info by user id
            if(code !== Code.OK) {
                next(null, {code: code});
                return;
            }

            if(!user) {
                next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
                return;
            }

            user.serverId = serverId;// 选择服务器Id
            uid = user.id;
            userInfo = user;
            userDao.getCharactersByLoginName(self.app, user.serverId, user.registerType, user.loginName, cb);
        }, function(res, cb) {
            // generate session and register chat status
            players = res;
            self.app.get('sessionService').kick(uid, cb);
        }, function(cb) {
            if(!players) {
                players = {};
            }
            session.bind(uid, cb);
            session.set('serverId', userInfo.serverId);
            session.set('registerType', userInfo.registerType);
            session.set('loginName', userInfo.loginName);
        }, function(cb) {
            if(!players || players.length === 0) {
                next(null, {code: Code.OK});
                return;
            }

            player = players[0];
            if(!player) {
                player = {};
            }
            session.set('areaId', player.currentScene);
            session.set('playername', player.nickname);
            session.set('playerId', player.id);
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        }, function(cb) {
            self.app.rpc.chat.chatRemote.add(session, player.userId, player.nickname, channelUtil.getGlobalChannelName(), cb);
        }
    ], function(err) {
        if(err) {
            next(err, {code: Code.FAIL});
            return;
        }

        next(null, {code: Code.OK, player: players ? players[0] : null});
    });
};

var onUserLeave = function (app, session, reason) {
    if(!session || !session.uid) {
        return;
    }
    logger.info("onUserLeave");

    app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), areaId: session.get('areaId')}, function(err) {
        if(!!err) {
            logger.error('user leave error! %j', err);
        }
    });
    app.rpc.chat.chatRemote.kick(session, session.uid, null);
};
