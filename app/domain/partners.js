/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: partners
 */
var util = require('util');
var Persistent = require('./persistent');
var consts = require('../consts/consts');

/**
 * Initialize a new 'Partners' with the given 'opts'.
 * Partners inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Partners = function(opts) {
    this.id = opts.taskId;
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.partner = opts.partner;
    this.allPartner = opts.allPartner;
};
util.inherits(Partners, Persistent);

/**
 * Expose 'Formation' constructor
 */

module.exports = Partners;