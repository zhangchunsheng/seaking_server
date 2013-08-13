/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: token
 */
var crypto = require('crypto');
var Buffer = require('buffer');

/**
 * Create token by uid. Encrypt uid and timestamp to get a token.
 *
 * @param  {String} uid user id
 * @param  {String|Number} timestamp
 * @param  {String} pwd encrypt password
 * @return {String} token string
 */
module.exports.create = function(userInfo, timestamp, pwd) {
    var msg = userInfo.registerType + '|' + userInfo.loginName + '|' + userInfo.userId + '|' + timestamp;
    var cipher = crypto.createCipher('aes256', pwd);
    var enc = cipher.update(msg, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

/**
 * Parse token to validate it and get the uid and timestamp.
 *
 * @param  {String} token token string
 * @param  {String} pwd   decrypt password
 * @return {Object}  uid and timestamp that exported from token. null for illegal token.
 */
module.exports.parse = function(token, pwd) {
    var decipher = crypto.createDecipher('aes256', pwd);
    var dec;
    try {
        dec = decipher.update(token, 'hex', 'utf8');
        dec += decipher.final('utf8');
    } catch(err) {
        console.error('[token] fail to decrypt token. %j', token);
        return null;
    }
    var ts = dec.split('|');
    if(ts.length !== 4) {
        // illegal token
        return null;
    }
    return {
        registerType: ts[0],
        loginName: ts[1],
        uid: ts[2],
        timestamp: Number(ts[3])
    };
};
