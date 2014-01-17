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
    this.data = [];

    this.update();
};
util.inherits(PushMessage, Persistent);

module.exports = PushMessage;

PushMessage.prototype.update = function() {
    for(var i = 0 ; i < this.pushMessage.length ; i++) {
        var message = {};
        for(var j in this.pushMessage[i]) {
            message[j] = this.pushMessage[i][j];
        }
        this.data.push(message);
    }
}

PushMessage.prototype.modifyData = function(message) {
    this.emit('modifyData');
}

PushMessage.prototype.strip = function() {
    var pushMessage = [];

    for(var i = 0 ; i < this.pushMessage.length ; i++) {
        if(this.pushMessage[i].num == 0)
            continue;
        pushMessage.push({
            type: this.pushMessage[i].type,
            message: this.pushMessage[i].message,
            num: this.pushMessage[i].num
        });
    }
    return pushMessage;
}

PushMessage.prototype.getInfo = function() {
    var pushMessage = [];

    for(var i = 0 ; i < this.pushMessage.length ; i++) {
        if(this.pushMessage[i].num == 0)
            continue;
        pushMessage.push({
            type: this.pushMessage[i].type,
            message: this.pushMessage[i].message,
            num: this.pushMessage[i].num
        });
    }
    return pushMessage;
}

PushMessage.prototype.getUpdateInfo = function() {
    return {
        pushMessage: this.pushMessage
    };
}