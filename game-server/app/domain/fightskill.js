/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: fightskill
 */

var util = require('util');
var dataApi = require('../util/dataApi');
var formula = require('../consts/formula');
var consts = require('../consts/consts');
var buff = require('./buff');
var Persistent = require('./persistent');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * 计算技能攻击伤害
 *
 * @param attacker
 * @param target
 * @param skill
 */
var attack = function(formation, attacker, targets) {

};

var calculateAttack = function() {

}

var calculateDefense = function() {

}

/**
 *
 * @param attacker
 * @param target
 * @param buff
 * @returns {{result: *}}
 */
var addBuff = function(attacker, target, buff) {
    if (buff.target === 'attacker' && !attacker.died) {
        buff.use(attacker);
    } else if (buff.target === 'target' && !target.died) {
        buff.use(target);
    }
    return {
        result: consts.AttackResult.SUCCESS
    };
};

var removeBuff = function(attacker, target, buff) {

};

/**
 *
 * @param opts
 * @constructor
 */
var FightSkill = function(opts) {
    Persistent.call(this, opts);
    this.skillId = opts.skillId;
    this.level = opts.level;
    this.playerId = opts.playerId;
    this.skillData = dataApi.fightskill.findById(this.skillId);
    this.name = this.skillData.skillName;
};

util.inherits(FightSkill, Persistent);

module.exports.FightSkill = FightSkill;
