/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-28
 * Description: speed
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('../buff');
var Persistent = require('../persistent');
var utils = require('../../utils/utils');

/**
 *
 * @param opts
 * @constructor
 */
var Speed = function(opts) {
    Persistent.call(this, opts);
    this.type = opts.type;
    this.value = opts.value;
};

util.inherits(Speed, Persistent);

module.exports = Speed;