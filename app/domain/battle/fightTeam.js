/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-15
 * Description: fightTeam
 */
var consts = require('../../consts/consts');

var FightTeam = function(opts) {
    this.id = opts.id;
    this.members = [];
    this.type = opts.type;
    this.buffs = [];
    this.buffKind = consts.buffKind.TEAM;
}

FightTeam.prototype.addBuff = function(buff) {
    this.buffs.push(buff);
}

FightTeam.prototype.addMember = function(player) {
    this.members.push(player);
}

FightTeam.prototype.calculateBuff = function(player) {

}

module.exports = FightTeam;