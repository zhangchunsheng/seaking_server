/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: auth
 */
var authService = require('../app/services/authService');
var userService = require('../app/services/userService');
var roleService = require('../app/services/roleService');
var tokenService = require('../shared/token');
var sessionToken = require('../config/session');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var session = require('../app/http/session');
var region = require('../config/region');
var consts = require('../app/consts/consts');

var DEFAULT_SECRET = 'wozlla_session_secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000;	// default session expire time: 6 hours

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 认证
 * @param req
 * @param res
 */
exports.auth = function(req, res) {
    var msg = req.query;

    var token = msg.token;
    var userInfo = tokenService.parse(token, sessionToken.secret);
    var data = {};
    if(!userInfo) {
        data = {code: Code.ENTRY.FA_TOKEN_ILLEGAL};
        utils.send(msg, res, data);
        return;
    }

    if(!checkExpire(userInfo, sessionToken.expire)) {
        data = {code: Code.ENTRY.FA_TOKEN_EXPIRE};
        utils.send(msg, res, data);
        return;
    }

    userInfo.serverId = region.serverId;

    userService.getCharactersByLoginName(userInfo.serverId, userInfo.registerType, userInfo.loginName, function(err, results) {
        if(err || !results) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }

        if(results[0] == null || results[0] == {}) {
            data = {
                code: Code.OK,
                player: null
            };
            roleService.getNickname(userInfo.serverId, function(err, reply) {
                data.nicknames = reply;
                utils.send(msg, res, data);
            });
        } else {
            data = {
                code: consts.MESSAGE.RES,
                player: results[0].strip(),
                sessionId: req.sessionID
            };
            userInfo.playerId = results[0].id;
            utils.send(msg, res, data);
        }
        session.setSession(req, res, userInfo);
    });
}

/**
 * Check the token whether expire.
 *
 * @param  {Object} token  token info
 * @param  {Number} expire expire time
 * @return {Boolean} true for not expire and false for expire
 */
var checkExpire = function(token, expire) {
    if(expire < 0) {
        // negative expire means never expire
        return true;
    }

    return (Date.now() - token.timestamp) < expire;
};