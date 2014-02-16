/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-29
 * Description: miscs
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
var Miscs = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;

    this.miscs = opts.miscs || [];
};

util.inherits(Miscs, Persistent);

module.exports = Miscs;

Miscs.prototype.checkHero = function(cId) {
    var type = 1;//1 - 实体 2 - 魂魄
    var miscs = this.miscs;
    for(var i = 0 ; i < miscs.length ; i++) {
        if(miscs[i].cId == cId) {
            type = 2;
            break;
        }
    }
    return type;
}

Miscs.prototype.setHero = function(cId) {
    var miscs = this.miscs;
    var time = (new Date()).getTime();
    miscs.push({
        cId: cId,
        getTime: time
    });
}

Miscs.prototype.strip = function() {
    var data = [];
    for(var i = 0 ; i < this.miscs.length ; i++) {
        data.push({
            cId: this.miscs[i].cId
        });
    }
    return data;
}

Miscs.prototype.getInfo = function() {
    var data = [];
    for(var i = 0 ; i < this.miscs.length ; i++) {
        data.push({
            cId: this.miscs[i].cId
        });
    }
    return data;
}

Miscs.create = function(opts) {

}