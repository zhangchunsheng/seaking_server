/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-25
 * Description: buffUtil
 */
var consts = require('../consts/consts');

var buffUtil = module.exports;

buffUtil.getInitBuff = function() {
    return [];
}

buffUtil.getBuff = function(buffId, buffs) {
    for(var i = 0 ; i < buffs.length ; i++) {
        if(buffs[i].buffId == buffId) {
            return buffs[i];
        }
    }
    return {};
}

buffUtil.getBuffByType = function(buffType, buffs) {
    for(var i = 0 ; i < buffs.length ; i++) {
        if(buffs[i].buffType == buffType) {
            return buffs[i];
        }
    }
    return {};
}

buffUtil.hasBuff = function(buffId, buffs) {
    for(var i = 0 ; i < buffs.length ; i++) {
        if(buffs[i].buffId == buffId) {
            return true;
        }
    }
    return false;
}

buffUtil.hasKindBuff = function(buffType, buffs) {
    for(var i = 0 ; i < buffs.length ; i++) {
        if(buffs[i].buffType == buffType) {
            return true;
        }
    }
    return false;
}

buffUtil.calculateValue = function(buffId, buffs) {

}