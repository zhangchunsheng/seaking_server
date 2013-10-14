/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: utils
 */
var message = require('../i18n/zh_CN.json');
var consts = require('../consts/consts');
var Token = require('../../shared/token')
    , secret = require('../../config/session').secret;

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

/**
 *
 * @param partnerId
 * @returns {string}
 */
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

utils.getTaskType = function(task) {
    var type = "";//1 - 主线任务 2 - 支线任务 3 - 日常任务 4 - 活动任务
    if(task.type == 1) {
        type = consts.curTaskType.CURRENT_MAIN_TASK;
    } else if(task.type == 2) {
        type = consts.curTaskType.CURRENT_BRANCH_TASK;
    } else if(task.type == 3) {
        type = consts.curTaskType.CURRENT_DAY_TASK;
    } else if(task.type == 4) {
        type = consts.curTaskType.CURRENT_EXERCISE_TASK;
    }
    return type;
}

utils.getEffectValue = function(effect, baseValue) {
    var value = 0;
    if(effect.valueType == consts.valueType.NUMBER)
        value = effect.value;
    if(effect.valueType == consts.valueType.PERCENTAGE)
        value = baseValue * effect.value / 100;

    return value;
}

utils.getEffectFocusValue = function(effect, baseValue, focus) {
    var value = 0;
    if(effect.valueType == consts.valueType.NUMBER)
        value = baseValue * focus * effect.value;
    if(effect.valueType == consts.valueType.PERCENTAGE)
        value = baseValue * focus * effect.value / 100;

    return value;
}

/**
 * get equipment type
 * 第3位表示位置序号
 * 1 - 衣服
 * 2 - 裤子
 * 3 - 鞋子
 * 4 - 护符
 * 5 - 项链
 * 6 - 戒指
 * @param eqId
 */
utils.getEqType = function(eqId) {
    var type = "";
    if(eqId.length == 5) {
        type = consts.EqType.WEAPON;
    } else {
        var num = eqId.substr(3, 1);
        switch(num) {
            case 1:
                type = consts.EqType.ARMOR;
                break;
            case 2:
                type = consts.EqType.LEGGUARD;
                break;
            case 3:
                type = consts.EqType.SHOES;
                break;
            case 4:
                type = consts.EqType.AMULET;
                break;
            case 5:
                type = consts.EqType.NECKLACE;
                break;
            case 6:
                type = consts.EqType.RING;
                break;
        }
    }
    return type;
}

/**
 * get userInfo by token
 * @param msg
 * @param req
 * @param res
 * @returns {*}
 */
utils.getUserInfo = function(msg, req, res) {
    var userInfo = {};
    if(typeof msg.token != "undefined") {
        userInfo = Token.parse(msg.token, secret);
        console.log(userInfo);
    } else {
        var headers = req.headers;
        if(typeof headers.signature == "undefined") {
            return null;
        }
        var signature = headers.signature;
        var test = Token.parseString(signature, secret);
        if(test.substr(5).length == 6) {
            var registerType = msg.registerType;
            var loginName = msg.loginName;
            userInfo = {
                registerType: registerType,
                loginName: loginName
            }
        } else {
            return null;
        }
    }
    return userInfo;
}

/**
 *
 * @param msg
 * @param res
 * @param data
 */
utils.send = function(msg, res, data) {
    if(typeof msg.jsoncallback == "undefined") {
        res.send(data);
    } else {
        res.send(msg.jsoncallback + "(" + JSON.stringify(data) + ")");
    }
}

utils.log = function(msg) {
    console.log(msg);
}

/**
 *
 * @param process
 */
utils.doProcess = function(process) {
    var argv = process.argv;
    var array = [];
    for(var i = 2 ; i < argv.length ; i++) {
        array = argv[i].split("=");
        if(array[0] == "env") {
            process.env.NODE_ENV = array[1];
        } else if(array[0] == "serverType") {
            process.env.SERVER_TYPE = array[1];
        } else if(array[0] == "port") {
            process.env.PORT = array[1];
        }
    }
}