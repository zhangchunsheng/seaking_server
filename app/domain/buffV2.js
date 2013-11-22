/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-23
 * Description: buffV2
 */
var util = require('util');
var Persistent = require('./persistent');
var consts = require('../consts/consts');
var dataApi = require('../utils/dataApi');

function Buff(opts) {
    Persistent.call(this, opts);
    this.useEffectId = opts.useEffectId;// 物品Id，效果Id XG
    this.startTime = opts.startTime;
    this.type = opts.type;// skill attr
    this.buffType = opts.buffType;
    this.buffKind = consts.buffKind.ITEM;// 1 - 道具 2 - 技能
    this.timeType = opts.timeType;
    this.timeValue = opts.timeValue;// 持续次数 持续回合
    this.isTempBuff = opts.isTempBuff || false;
    this.buffData = opts.buffData || {};// effect
    this.skillId = opts.skillId;
    this.skillType = opts.skillType;// 主动技能buff 被动技能buff
    this.skillLevel = opts.skillLevel;
    this.skillData = opts.skillData;

    this.updateAttribute();
}

Buff.prototype.updateAttribute = function() {
    if(this.useEffectId.indexOf("XG") == 0) {
        this.buffKind = consts.buffKind.SKILL;
    } else {
        this.buffKind = consts.buffKind.ITEM;
        //this.buffData = dataApi.itemEffect.findById(this.useEffectId);
    }
}

Buff.prototype.updatePlayerAttribute = function() {
    if(this.buffKind == consts.buffKind.ITEM) {

    } else if(this.buffKind == consts.buffKind.SKILL) {

    }
}

/**
 * 更新buff
 */
Buff.prototype.updateBuff = function() {

}

Buff.prototype.use = function(player) {
    player.addBuff(this);
};

Buff.prototype.strip = function() {
    return {
        useEffectId: this.useEffectId,
        startTime: this.startTime
    }
}

Buff.prototype.getInfo = function() {
    return {
        useEffectId: this.useEffectId,
        startTime: this.startTime
    }
}

Buff.create = function(skill) {

}

util.inherits(Buff, Persistent);

module.exports = Buff;