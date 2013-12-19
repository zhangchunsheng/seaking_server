/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-19
 * Description: diamond
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
var Diamond = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;

    this.name = opts.name;
    this.icon = opts.icon;
    this.quality = opts.quality;
    this.attrId = opts.attrId;
    this.attrValue = opts.attrValue;
};

util.inherits(Diamond, Persistent);

module.exports = Diamond;