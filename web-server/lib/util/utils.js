/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: utils
 */
var message = require('../../i18n/zh_CN.json');
var utils = module.exports;

/**
 * 驗證用戶名
 */
utils.validLoginName = function(loginName) {
    if((loginName.length < 6) || (loginName.length > 16)) {
        return {
            validNum: 0,
            message: message.loginName_length
        };
    }
    var pattern=/[a-z,A-Z]+/;
    if(!pattern.test(loginName)) {
        return {
            validNum: -1,
            message: message.loginName_valid
        };
    }
    return {
        validNum: 1
    };
}

/**
 * 驗證密碼
 */
utils.validPassword = function(password) {
    if((password.length < 6) || (password.length > 16)) {
        return {
            validNum: 0,
            message: message.password_length
        };
    }
    return {
        validNum: 1
    };
}

/**
 * random
 * @param lower
 * @param higher
 * @returns {number}
 */
utils.random = function(lower, higher) {
    return Math.floor(Math.random() * (higher + 1 - lower)) + lower;
}