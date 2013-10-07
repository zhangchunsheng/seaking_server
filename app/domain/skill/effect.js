/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-28
 * Description: effect
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
var Effect = function(opts) {
    Persistent.call(this, opts);
    this.attr = opts.attr;
    this.valueType = opts.valueType;
    this.value = opts.value;
    this.targetType = opts.targetType;
    this.targetValue = opts.targetValue;
    this.timeType = opts.timeType;
    this.timeValue = opts.timeValue;
};

util.inherits(Effect, Persistent);

module.exports = Effect;