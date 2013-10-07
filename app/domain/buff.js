/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: buff
 */

function Buff(opts) {
    this.useEffectId = opts.useEffectId;
    this.startTime = opts.startTime;
    this.type = opts.type;
    this.count = opts.count;// 持续次数
}

Buff.prototype.use = function(player) {
    player.addBuff(this);
};

Buff.create = function(skill) {

}

module.exports = Buff;

