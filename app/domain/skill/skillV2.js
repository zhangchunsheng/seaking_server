/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: fightskill
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('../buff');
var Persistent = require('../persistent');
var utils = require('../../utils/utils');
var skill_script = require('../../../scripts/skill_scriptV2');
var triggerSkill_script = require('../../../scripts/triggerSkill_scriptV2');

/**
 *
 * @param opts
 * @constructor
 */
var Skill = function(opts) {
    Persistent.call(this, {
        id: opts.id
    });
    this.skillId = opts.skillId;
    this.additional = {};//额外加成
    if(opts.id.indexOf("SK") >= 0) {
        this.skillData = dataApi.skillsV2.findById(opts.id);
    } else {
        this.skillData = dataApi.skillsV2.findByMId(opts.id);
    }
    this.name = this.skillData.skillName;
    this.type = this.skillData.type;
    this.level = opts.level || this.skillData.level;
};

util.inherits(Skill, Persistent);

module.exports = Skill;

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
        if(effects[j].attr == consts.effectName.ADDATTACK) {
            this.attack = utils.getEffectValue(effects[j], player.attack);
        } else {
            this[effects[j].attr] = utils.getEffectValue(effects[j], player[effects[j].attr]);
        }
    }
}

Skill.prototype.invokeScript = function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var array = [];
    array.push(attackSide);
    array.push(condition);
    array.push(attack_formation);
    array.push(defense_formation);
    array.push(attack);
    array.push(defense);
    array.push(attacks);
    array.push(defenses);
    array.push(attackFightTeam);
    array.push(defenseFightTeam);
    array.push(fightData);
    array.push(attackData);
    array.push(defenseData);
    return skill_script["skill" + this.skillId.replace("SK", "")].apply(this, array);
}

Skill.prototype.invokeTriggerScript = function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var array = [];
    array.push(attackSide);
    array.push(condition);
    array.push(attack_formation);
    array.push(defense_formation);
    array.push(attack);
    array.push(defense);
    array.push(attacks);
    array.push(defenses);
    array.push(attackFightTeam);
    array.push(defenseFightTeam);
    array.push(fightData);
    array.push(attackData);
    array.push(defenseData);
    return triggerSkill_script["skill" + this.skillId.replace("SK", "")].apply(this, array);
}

/**
 * 释放技能
 * @param player
 * @param attackType
 */
Skill.prototype.release = function(player, attackType) {

}

Skill.create = function(opts) {

}
