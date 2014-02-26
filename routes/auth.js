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
var signature = require('cookie-signature');

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
    utils.addOrigin(res, req);
    if(utils.empty(token)) {
        data = {code: Code.ENTRY.FA_TOKEN_ILLEGAL};
        utils.send(msg, res, data);
        return;
    }
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
        //console.log(results);
        if(err || !results) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }

        var connectSid = req.headers["cookie"];
        if(connectSid && connectSid.indexOf("connect.sid") >= 0) {
            var connectSidArray = connectSid.split("; ");
            for(var i = 0 ; i < connectSidArray.length ; i++) {
                if(connectSidArray[i].indexOf("connect.sid") >= 0) {
                    connectSid = connectSidArray[i];
                }
            }
        } else {
            var val = 's:' + signature.sign(req.sessionID, "html5");
            var cookie = req.session.cookie;
            var key = "connect.sid";
            val = cookie.serialize(key, val);
            connectSid = val;
        }
        if(results[0] == null || results[0] == {}) {
            data = {
                code: Code.OK,
                player: null,
                connectSid: connectSid
            };
            roleService.getNickname(userInfo.serverId, function(err, reply) {
                data.nicknames = reply;
                utils.send(msg, res, data);
            });
        } else {
            data = {
                code: consts.MESSAGE.RES,
                player: results[0].strip(),
                connectSid: connectSid
            };
            //
            userInfo.playerId = results[0].id;
            /*var log4js = require("log4js");
            log4js.configure({appenders:[{type: "file", filename:"auth.log",category:["auth"]}]})
            var mlog = log4js.getLogger("auth");
            mlog.info(JSON.stringify(data));*/
            //data = require("lz-string").compressToBase64(JSON.stringify(data));
            //data = require("lz-string").compressToUTF16(JSON.stringify(data));
            //res.send(data);
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