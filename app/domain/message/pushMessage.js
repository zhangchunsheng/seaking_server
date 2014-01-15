/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-01-15
 * Description: pushMessage
 */
/**
 * Module dependencies
 */

var util = require('util');
var Persistent = require('../persistent');
var consts = require('../../consts/consts');

/**
 *
 * @param opts
 * @constructor
 */
var PushMessage = function(opts) {
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;

    this.pushMessage = opts.pushMessage;
};
util.inherits(PushMessage, Persistent);

module.exports = PushMessage;

PushMessage.prototype.strip = function() {

}

PushMessage.prototype.getInfo = function() {
    var pushMessage = [];

    for(var i = 0 ; i < this.pushMessage.length ; i++) {
        pushMessage.push({
            type: this.pushMessage[i].type,
            message: this.pushMessage[i].message,
            num: this.pushMessage[i].num
        });
    }
    return pushMessage;
}