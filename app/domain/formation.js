/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-08
 * Description: formation
 */
var util = require('util');
var Persistent = require('./persistent');
var consts = require('../consts/consts');

/**
 * Initialize a new 'Formation' with the given 'opts'.
 * Formation inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Formation = function(opts) {
    this.id = opts.taskId;
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;

    this.tacticalId = opts.tacticalId;
    this.formation = opts.formation;
    this.lastFormation = opts.lastFormation;
};
util.inherits(Formation, Persistent);

/**
 * Expose 'Formation' constructor
 */

module.exports = Formation;