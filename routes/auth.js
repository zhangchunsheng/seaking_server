/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: auth
 */
var authService = require('../app/services/authService');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 认证
 * @param req
 * @param res
 */
exports.auth = function(req, res) {
    logger.info(token);
    var res = tokenService.parse(token, this.secret);
    logger.info(res);
    if(!res) {
        cb(null, Code.ENTRY.FA_TOKEN_ILLEGAL);
        return;
    }

    if(!checkExpire(res, this.expire)) {
        cb(null, Code.ENTRY.FA_TOKEN_EXPIRE);
        return;
    }

    userDao.getUserByLoginName(this.app, res.registerType, res.loginName, function(err, user) {
        if(err) {
            cb(err);
            return;
        }

        cb(null, Code.OK, user);
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