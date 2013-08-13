/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: utils
 */
var message = require('../i18n/zh_CN.json');
var utils = module.exports;

/**
 * Check and invoke callback function
 * @param cb
 */
utils.invokeCallback = function(cb) {
    if(!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
}

/**
 * clone an object
 *
 * @param origin
 */
utils.clone = function(origin) {
    if(!origin) {
        return;
    }

    var obj = {};
    for(var f in origin) {
        if(origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
}

utils.size = function(obj) {
    if(!obj) {
        return 0;
    }

    var size = 0;
    for(var f in obj) {
        if(obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
}

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

/**
 *
 * @param value
 * @param max
 * @returns {*}
 */
utils.getMax = function(value, max) {
    return value > max ? value : max;
}

utils.sortArray = function(array, sortBy, flag) {
    return array.sort(function(a, b) {
        if(a[sortBy] > b[sortBy]) {
            return flag ? -1 : 1;
        }
        if(a[sortBy] < b[sortBy]) {
            return flag ? 1 : -1;
        }
        return 0;
    });
}

utils.sort = function(array, sortBy) {
    var temp = {};
    for(var i = 0 ; i < array.length ; i++) {
        for(var j = i + 1 ; j < array.length ; j++) {
            if(array[j].speedLevel > array[i].speedLevel) {
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
    }
}

utils.getRealPartnerId = function(partnerId) {
    partnerId = partnerId.substr(partnerId.indexOf("P") + 1);
    return partnerId;
}

/**
 *
 * @param characterId
 * @returns {string}
 */
utils.getRealCharacterId = function(characterId) {
    characterId = characterId.substr(characterId.indexOf("C") + 1);
    return characterId;
}