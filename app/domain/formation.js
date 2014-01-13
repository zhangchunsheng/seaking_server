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
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.characterId = opts.characterId;
    this.cId = opts.cId;

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

Formation.prototype.checkFormation = function(player, formation) {
    var result = 0;
    var player_formation = player.formation.formation;
    var players = [];
    players.push(player.id);
    for(var i = 0 ; i < player.partners.length ; i++) {
        players.push(player.partners[i].id);
    }
    var flag = false;
    var playerId = "";
    var players_args = [];//判断playerId唯一
    for(var i in player_formation) {
        flag = false;
        if(typeof formation[i] == "undefined") {
            result = 0;
            return result;
        }
        playerId = formation[i];
        if(playerId == null)
            continue;

    }
    //判断是否存在playerId
    return result;
}

Formation.prototype.strip = function() {
    return {
        formation: this.formation,
        tacticals: this.tacticals
    }
}

Formation.prototype.getInfo = function() {
    return {
        formation: this.formation,
        tacticals: this.tacticals
    }
}