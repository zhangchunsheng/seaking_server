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
            num: this.pushMessage[i].num,
            data: this.pushMessage[i].data || {}
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
            num: this.pushMessage[i].num,
            data: this.pushMessage[i].data || {}
        });
    }
    return pushMessage;
}

PushMessage.prototype.getUpdateInfo = function() {
    return {
        pushMessage: this.pushMessage
    };
}

/**
 * addPushMessage
 * @param message
 * @returns {{pushMessage: *}}
 */
PushMessage.prototype.addPushMessage = function(message) {
    var pushMessage = this.pushMessage;
    var flag = false;
    var date = new Date();
    for(var i = 0 ; i < pushMessage.length ; i++) {
        if(pushMessage[i].type == message.type) {
            if(pushMessage[i].type == consts.pushMessageType.TASK) {
                if(pushMessage[i].data.taskId == message.data.taskId) {
                    flag = true;
                    pushMessage[i].num = message.num;
                    pushMessage[i].message = message.message;
                    pushMessage[i].data = message.data;
                    pushMessage[i].pushDate = date.getTime();
                }
            } else {
                flag = true;
                if(message.num == 0) {
                    //pushMessage.splice(i, 1);
                    pushMessage[i].num = message.num;
                    pushMessage[i].message = message.message;
                    pushMessage[i].pushDate = date.getTime();
                } else {
                    pushMessage[i].num = message.num;
                    pushMessage[i].message = message.message;
                    pushMessage[i].pushDate = date.getTime();
                }
            }
        }
    }
    if(!flag) {
        if(message.num != 0) {
            pushMessage.push({
                type: message.type,
                message: message.message,
                num: message.num,
                data: message.data || {},
                date: date.getTime(),
                pushDate: date.getTime()
            });
        }
    }
}