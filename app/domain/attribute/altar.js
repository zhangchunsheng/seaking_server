/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-02-15
 * Description: altar
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
var Altar = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;

    this.loyalty = opts.loyalty;//侠义值
    this.extractionTimes = opts.extractionTimes;//冻结时间
};

util.inherits(Altar, Persistent);

module.exports = Altar;

Altar.prototype.strip = function() {
    return {
        loyalty: this.loyalty,
        extractionTimes: this.extractionTimes
    };
}

Altar.prototype.getInfo = function() {
    var extractionTimes = this.extractionTimes;
    var refrigerationTime;
    var pastTime = 0;
    var date = new Date();
    for(var i in extractionTimes) {
        pastTime = date.getTime() - extractionTimes[i].lastExtractionTime;
        refrigerationTime = dataApi.altars.findById("1").refrigerationTime * 60 * 60 * 1000;
        extractionTimes[i].leftTime = Math.round((refrigerationTime - pastTime) / 1000);
        if(extractionTimes[i].leftTime < 0) {
            extractionTimes[i].leftTime = 0;
        }
    }

    return {
        loyalty: this.loyalty,
        extractionTimes: extractionTimes
    };
}

Altar.create = function(opts) {

}