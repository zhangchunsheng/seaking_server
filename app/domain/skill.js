/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: fightskill
 */

var util = require('util');
var dataApi = require('../utils/dataApi');
var formula = require('../consts/formula');
var consts = require('../consts/consts');
var buff = require('./buff');
var Persistent = require('./persistent');
var utils = require('../utils/utils');

/**
 *
 * @param opts
 * @constructor
 */
var Skill = function(opts) {
    Persistent.call(this, {
        id: opts.skillId
    });
    this.skillId = opts.skillId;
    this.additional = {};//额外加成
    this.skillData = dataApi.skillList.findById(opts.skillId);
    this.name = this.skillData.skillName;
    this.type = this.skillData.type;
    this.level = this.skillData.level;
};

Skill.prototype.attack = function() {

}

Skill.prototype.updateFightValue = function(player) {
    var attack = 0;
    var defense = 0;
    var speedLevel = 0;
    var hp = 0;
    var focus = 0;
    var criticalHit = 0;
    var critDamage = 0;
    var dodge = 0;
    var block = 0;
    var counter = 0;
    var counterDamage = 0;

    var effects = this.skillData.effects;
    for(var j = 0 ; j < effects.length ; j++) {
        if(effects[j].attr == consts.buffType.ADDATTACK) {
            this.attack = utils.getEffectValue(effects[j], player.attack);
        } else {
            this[effects[j].attr] = utils.getEffectValue(effects[j], player[effects[j].attr]);
        }
    }
}

Skill.create = function(opts) {

}

util.inherits(Skill, Persistent);

module.exports = Skill;
