/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: buff
 */
var util = require('util');
var Persistent = require('./persistent');

function Buff(opts) {
    Persistent.call(this, opts);
    this.useEffectId = opts.useEffectId;
    this.startTime = opts.startTime;
    this.type = opts.type;
    this.count = opts.count;// 持续次数
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

