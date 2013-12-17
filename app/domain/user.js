/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: user
 */
/**
 *Module dependencies
 */

var util = require('util');

/**
 * Initialize a new 'User' with the given 'opts'.
 *
 * @param {Object} opts
 * @api public
 */

var User = function(opts) {
    this.id = opts.id;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.from = opts.from || '';
    this.characters = opts.characters;
    this.registerDate = opts.registerDate;
    this.loginCount = opts.loginCount;
    this.lastLoginDate = opts.lastLoginDate;
    this.updateRoleDate = opts.updateRoleDate;
    this.onlineTime = opts.onlineTime;
    this.onlineDayNum = opts.onlineDayNum;
    this.onlineDayNumContinuous = opts.onlineDayNumContinuous;
    this.isOnline = opts.isOnline;
};

/**
 * Expose 'Entity' constructor
 */

module.exports = User;
