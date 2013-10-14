/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-14
 * Description: fightData
 */
var FightData = function(opts) {
    this.fId = opts.fId;
    this.id = opts.id;
    this.action = opts.action;
    this.hp = opts.hp;
    this.anger = opts.anger || 0;
    this.died = opts.died || false;
}

/**
 * strip
 */
FightData.prototype.strip = function() {
    var data = {
        fId: this.fId,
        id: this.id,
        action: this.action,
        hp: this.hp
    }
    if(this.anger > 0) {
        data.anger = this.anger;
    }
    if(this.died) {
        data.died = this.died;
    }
    return data;
}