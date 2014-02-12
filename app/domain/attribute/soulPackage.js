/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-29
 * Description: soulPackage
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('../buff');
var Persistent = require('../persistent');
var utils = require('../../utils/utils');
var BasePackage = require('../package/basePackage');

/**
 *
 * @param opts
 * @constructor
 */
var SoulPackage = function(opts) {
    BasePackage.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;
    this.items = opts.items;
    this.itemCount = opts.itemCount || 12;
    this.indexStart = 0;
};

util.inherits(SoulPackage, BasePackage);

module.exports = SoulPackage;

SoulPackage.create = function(opts) {

}

SoulPackage.prototype.isFull = function() {
    var count = 0;
    for(var i = this.indexStart, l = this.itemCount + this.indexStart; i < l; i++ ) {
        if(this.items[i]) {
            count++;
        }
    }
    if(this.itemCount == count) {
        return true;
    } else {
        return false;
    }
}