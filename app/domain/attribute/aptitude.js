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

/**
 *
 * @param opts
 * @constructor
 */
var Aptitude = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;

    this.aptitudeInfo = {};
    for(var i = 1 ; i <= 9 ; i++) {
        if(typeof opts[i] != "undefined")
            this.aptitudeInfo[i] = opts[i];
    }
    this.count = opts.count;
    this.upgradeDate = opts.upgradeDate;

    this[consts.attrId.HP] = opts[consts.attrId.HP] || {"level":0};
    this[consts.attrId.ATTACK] = opts[consts.attrId.ATTACK] || {"level":0};
    this[consts.attrId.DEFENSE] = opts[consts.attrId.DEFENSE] || {"level":0};
    this[consts.attrId.SUNDERARMOR] = opts[consts.attrId.SUNDERARMOR] || {"level":0};
    this[consts.attrId.SPEED] = opts[consts.attrId.SPEED] || {"level":0};
    this[consts.attrId.CRITICALHIT] = opts[consts.attrId.CRITICALHIT] || {"level":0};
    this[consts.attrId.BLOCK] = opts[consts.attrId.BLOCK] || {"level":0};
    this[consts.attrId.DODGE] = opts[consts.attrId.DODGE] || {"level":0};
    this[consts.attrId.COUNTER] = opts[consts.attrId.COUNTER] || {"level":0};

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

    this.initAptitude(opts);
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

util.inherits(Aptitude, Persistent);

module.exports = Aptitude;

Aptitude.prototype.initAptitude = function(opts) {
    var cId = utils.getRealCharacterId(this.playerId);
    var heroId = utils.getCategoryHeroId(cId);
    this.heroId = heroId;
    this.aptitudeData = dataApi.aptitudes.findById(heroId);
}

Aptitude.prototype.calculateValue = function() {
    for(var i in this.aptitudeInfo) {
        this[dict[i - 1]] = (this.aptitudeData[dict[i - 1]] / 50 * this.aptitudeInfo[i].level).toFixed(2);
        if(this[dict[i - 1]] == 0) {
            this[dict[i - 1]] = 0;
        }
        //this[dict[i - 1] + "Info"] = "" + this[dict[i - 1]] + " +" + (this.aptitudeData[dict[i - 1]] / 50).toFixed(2);
        this[dict[i - 1] + "Info"] = "" + this[dict[i - 1]];
    }
}

Aptitude.prototype.strip = function() {
    var data = {};
    data.aptitude = this.aptitudeInfo;
    data.attrValue = {};
    for(var i in this.aptitudeInfo) {
        data.attrValue[i] = this[dict[i - 1] + "Info"];
    }
    return data;
}

Aptitude.prototype.getInfo = function() {
    var data = {};
    data.aptitude = this.aptitudeInfo;
    data.attrValue = {};
    for(var i in this.aptitudeInfo) {
        data.attrValue[i] = this[dict[i - 1] + "Info"];
    }
    return data;
}

Aptitude.create = function(opts) {

}
