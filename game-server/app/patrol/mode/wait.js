/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: wait
 */
var patrol = require('../patrol');

/**
 * Wait mode: wait ticks and then return finish.
 */
var Mode = function(opts) {
    this.tick = opts.tick||1;
};

module.exports = Mode;

var pro = Mode.prototype;

pro.update = function() {
    if(!this.tick) {
        return patrol.RES_FINISH;
    }

    this.tick--;
    return patrol.RES_WAIT;
};
