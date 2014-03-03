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

    this.diedPlayers = [];
}

FightTeam.prototype.addBuff = function(buff) {
    this.buffs.push(buff);
}

FightTeam.prototype.getBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        buffs.push(this.buffs[i].baseInfo());
    }
    return buffs;
}

FightTeam.prototype.getSkillBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffKind == consts.buffKind.SKILL)
            buffs.push(this.buffs[i]);
    }
    return buffs;
}

FightTeam.prototype.getToolBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffKind == consts.buffKind.ITEM)
            buffs.push(this.buffs[i]);
    }
    return buffs;
}

/**
 * Remove buff from buffs.
 *
 * @param {Buff} buff
 * @api public
 */
FightTeam.prototype.removeBuff = function(buff) {
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffId == buff.buffId) {
            this.buffs.splice(i, 1);
            break;
        }
    }
};

FightTeam.prototype.addMember = function(player) {
    this.members.push(player);
}

FightTeam.prototype.calculateBuff = function(player) {

}

/**
 * addDiedPlayer
 * @param player
 */
FightTeam.prototype.addDiedPlayer = function(player) {
    for(var i = 0 ; i < this.diedPlayers.length ; i++) {
        if(this.diedPlayers[i].id == player.id) {
            return;
        }
    }
    this.diedPlayers.push(player);
}

/**
 * getLastDiedPlayer
 */
FightTeam.prototype.getLastDiedPlayer = function() {
    if(this.diedPlayers.length == 0) {
        return null;
    }
    return this.diedPlayers[this.diedPlayers.length - 1];
}

/**
 * removeDiedPlayer
 * @param player
 */
FightTeam.prototype.removeDiedPlayer = function(player) {
    for(var i = 0 ; i < this.diedPlayers.length ; i++) {
        if(this.diedPlayers[i].id == player.id) {
            this.diedPlayers.splice(i, 1);
            break;
        }
    }
}

/**
 * removeDiedPlayerByIndex
 * @param index
 */
FightTeam.prototype.removeDiedPlayerByIndex = function(index) {
    this.diedPlayers.splice(index, 1);
}

module.exports = FightTeam;