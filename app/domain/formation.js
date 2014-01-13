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

    this.formation = opts.formation;
    this.lastFormation = opts.lastFormation;

    this.tacticals = opts.tacticals;//阵法列表
};
util.inherits(Formation, Persistent);

/**
 * Expose 'Formation' constructor
 */

module.exports = Formation;

Formation.prototype.initFormation = function() {
    var formation = {formation:{1:{playerId:"S" + this.serverId + "C" + this.characterId}},tactical:{id:"F101",level:1}};
    return formation;
}

Formation.prototype.initTacticals = function() {
    var tacticals = [{"id":"F101","level":1,"active":1}];
    return tacticals;
}