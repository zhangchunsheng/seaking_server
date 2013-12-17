/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-16
 * Description: aptitude
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('../buff');
var Persistent = require('../persistent');
var utils = require('../../utils/utils');
var ghosts = require('../../../config/data/ghosts');

/**
 *
 * @param opts
 * @constructor
 */
var Ghost = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;

    this.level = parseInt(opts.level) || 0;
    this.number = parseInt(opts.number) || 0;
    this.addGhostNumOneMinute = consts.addGhostNumOneMinute || 10;

    this.hp = 0;
    this.attack = 0;
    this.defense = 0;
    this.sunderArmor = 0;
    this.speed = 0;
    this.criticalHit = 0;
    this.block = 0;
    this.dodge = 0;
    this.counter = 0;

    this.nextLevelId = 0;

    this.hpInfo = "";
    this.attackInfo = "";
    this.defenseInfo = "";
    this.sunderArmorInfo = "";
    this.speedInfo = "";
    this.criticalHitInfo = "";
    this.blockInfo = "";
    this.dodgeInfo = "";
    this.counterInfo = "";

    this.initGhost(opts);
    this.calculateValue();
};

/*1 - 生命
 2 - 攻击
 3 - 防御
 4 - 幸运
 5 - 速度
 6 - 暴击
 7 - 格挡
 8 - 闪避
 9 - 反击*/
var dict = [
    'hp',
    'attack',
    'defense',
    'sunderArmor' ,
    'speed',
    'criticalHit',
    'block',
    'dodge',
    'counter'
];

util.inherits(Ghost, Persistent);

module.exports = Ghost;

Ghost.prototype.initGhost = function(opts) {
    var cId = utils.getRealCharacterId(this.playerId);
    var heroId = utils.getCategoryHeroId(cId);
    this.heroId = heroId;
    this.ghostData = ghosts[heroId];
    if(typeof this.ghostData[this.level] != "undefined")
        this.nextLevelId = this.level + 1;
}

Ghost.prototype.calculateValue = function() {
    for(var i = 0 ; i < this.level ; i++) {
        this[dict[this.ghostData[i].attrId - 1]] += parseInt(this.ghostData[i].attrValue);
        this[dict[this.ghostData[i].attrId - 1] + "Info"] = this[dict[this.ghostData[i].attrId - 1]];
    }
    /*if(this.nextLevelId != 0) {
        if(this[dict[this.ghostData[this.nextLevelId - 1].attrId - 1] + "Info"] == "") {
            this[dict[this.ghostData[this.nextLevelId - 1].attrId - 1] + "Info"] = "0 +" + this.ghostData[this.nextLevelId - 1].attrValue;
        } else {
            this[dict[this.ghostData[this.nextLevelId - 1].attrId - 1] + "Info"] += " +" + this.ghostData[this.nextLevelId - 1].attrValue;
        }
    }*/
}

Ghost.prototype.strip = function() {
    var data = {};
    data.ghost = {
        level: this.level,
        number: this.number
    };
    data.attrValue = {};
    for(var i = 1 ; i <= 9 ; i++) {
        if(this[dict[i - 1] + "Info"] == "") {
            data.attrValue[i] = "0";
        } else {
            data.attrValue[i] = this[dict[i - 1] + "Info"];
        }
    }

    return data;
}

Ghost.prototype.getInfo = function() {
    var data = {};
    data.ghost = {
        level: this.level
    };
    data.attrValue = {};
    for(var i = 1 ; i <= 9 ; i++) {
        if(this[dict[i - 1] + "Info"] == "") {
            //data.attrValue[i] = "0";
        } else {
            data.attrValue[i] = this[dict[i - 1] + "Info"];
        }
    }

    return data;
}

Ghost.create = function(opts) {

}
