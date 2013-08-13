/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: authRemote
 */
var tokenService = require('../../../../../shared/token');
var userDao = require('../../../dao/userDao');
var Code = require('../../../../../shared/code');
var logger = require('pomelo-logger').getLogger(__filename);

var DEFAULT_SECRET = 'pomelo_session_secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000;	// default session expire time: 6 hours

module.exports = function(app) {
    return new Remote(app);
};

var Remote = function(app) {
    this.app = app;
    var session = app.get('session') || {};
    this.secret = session.secret || DEFAULT_SECRET;
    this.expire = session.expire || DEFAULT_EXPIRE;
};

var pro = Remote.prototype;

/**
 * Auth token and check whether expire.
 *
 * @param  {String} token token string
 * @param  {Function} cb
 * @return {Void}
 */
pro.auth = function(token, cb) {
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
};

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
