/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-31
 * Description: message
 */
/**
 * Module dependencies
 */

var util = require('util');
var Persistent = require('./persistent');
var consts = require('../consts/consts');

/**
 *
 * @param opts
 * @constructor
 */
var Message = function(opts) {
    this.type = opts.type;
    this.num = opts.num;
    this.message = opts.message;
    this.data = opts.data || {};
    this.date = opts.date;
    this.pushDate = opts.pushDate;
};
util.inherits(Message, Persistent);

module.exports = Message;

Message.prototype.strip = function() {
    return {
        type: this.type,
        num: this.num,
        message: this.message,
        data: this.data
    }
}