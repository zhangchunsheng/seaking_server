/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: character
 */
/**
 * Module dependencies
 */
var pomelo = require('pomelo');
var util = require('util');
var utils = require('../../util/utils');
var dataApi = require('../../util/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var Entity = require('./entity');
var area = require('./../area/area');
var fightskill = require('./../fightskill');
var logger = require('pomelo-logger').getLogger(__filename);

var Character = function(opts) {
    Entity.call(this, opts);
    this.orientation = opts.orientation;// 方向

    this.attackers = [];// 记录攻击次数
    this.costTime = 0;// 记录到达每一个节点的用时
    this.distance = 0;// 行走距离

    this.cId = opts.cId;

    // I would notify my enemies to forget me when I disapear or die
    this.enemies = {};

    this.died = false;
    this.hp = opts.hp;
    this.anger = opts.anger;// 能量值
    this.maxHp = opts.maxHp;
    this.maxAnger = opts.maxAnger || 100;// 最大能量值
    this.restoreHpSpeed = opts.restoreHpSpeed || 10;//生命值恢复速度
    this.restoreAngerSpeed = opts.restoreAngerSpeed || 10;//能量恢复速度
    this.level = opts.level;
    this.experience = opts.experience;
    this.attack = opts.attack;//攻击
    this.defense = opts.defense;//防御
    this.totalAttack = opts.totalAttack || 0;//攻击
    this.totalDefense = opts.totalDefense || 0;//防御
    this.focus = opts.focus;//集中值
    this.dodge = opts.dodge;//闪避
    this.block = opts.block;//格挡
    this.criticalHit = opts.criticalHit;//暴击
    this.critDamage = opts.critDamage;//暴击
    this.counter = opts.counter;//反击

    this.baseAttack = opts.attack;
    this.baseDefense = opts.defense;
    this.baseSpeedLevel = opts.speedLevel;
    this.baseHp = opts.hp;

    this.photo = opts.photo;

    this.walkSpeed = opts.walkSpeed;//跑动速度
    this.speedLevel = opts.speedLevel;//速度level
    this.speed = opts.speed;//speed
    this.attackSpeed = opts.attackSpeed;//攻速
    this.isMoving = false;

    this.formationId = opts.formationId;

    this.attackParam = 1;
    this.defenseParam = 1;
    this.equipmentParam = 1;
    this.hasBuff = false;
    this.buffs = [];
    this.curSkill = 1;  //default normal attack
    this.characterData = dataApi.character.findById(this.cId);
    this.fightSkills = {};
    this.activeSkills = opts.activeSkills;// 主动技能
    this.passiveSkills = opts.passiveSkills;// 被动技能
};

util.inherits(Character, Entity);

/**
 * Expose 'Character' constructor.
 */
module.exports = Character;


/**
 * Add skills to the fightSkills.
 *
 * @param {Array} fightSkills
 * @api public
 */
Character.prototype.addFightSkills = function(fightSkills) {
    for (var i = 0; i < fightSkills.length; i++) {
        var skill = fightskill.create(fightSkills[i]);
        this.fightSkills[skill.skillId] = skill;
    }
};

/**
 * Get fight skill data
 *
 * @api public
 */
Character.prototype.getFightSkillData = function(){
    var data = [];
    for(var key in this.fightSkills){
        var fs = {
            id : Number(key),
            level : this.fightSkills[key].level
        };

        data.push(fs);
    }

    return data;
};

/**
 * Reset the hp.
 *
 * @param {Number} maxHp
 * @api public
 */
Character.prototype.resetHp = function(maxHp) {
    this.maxHp = maxHp;
    this.hp = this.maxHp;
};

/**
 * Recover the hp.
 *
 * @param {Number} hpValue
 * @api public
 */
Character.prototype.recoverHp = function(hpValue) {
    if(this.hp >= this.maxHp) {
        return;
    }

    var hp = this.hp + hpValue;
    if(hp > this.maxHp) {
        this.hp = this.maxHp;
    } else {
        this.hp = hp;
    }
};

/**
 * Move to the destination of (x, y).
 * the map will calculate path by startPosition(startX, startY), endPosition(endX, endY) and cache
 * if the path exist, it will emit the event 'move', or return false and loggerWarn
 *
 * @param {Number} targetX
 * @param {Number} targetY
 * @param {Boolean} useCache
 * @api public
 */
Character.prototype.move = function(targetX, targetY, useCache, cb) {

};

/**
 * attack the target.
 *
 * @param {Character} target
 * @param {Number} skillId
 * @return {Object}
 */
Character.prototype.attack = function(target, skillId) {

};

/**
 * Get attackValue.
 *
 * @return {Number}
 * @api private
 */
Character.prototype.getAttackValue = function() {
    return this.attack * this.attackParam;
};

/**
 * Get defenseValue.
 *
 * @return {Number}
 * @api private
 */
Character.prototype.getDefenseValue = function() {
    return this.defense * this.defenseParam;
};

/**
 * Get total attackValue.
 *
 * @return {Number}
 * @api public
 */
Character.prototype.getTotalAttack = function() {
    return this.totalAttack;
};

/**
 * Get total defenseValue.
 *
 * @return {Number}
 * @api public
 */
Character.prototype.getTotalDefence = function() {
    return this.totalDefense;
};

/**
 * Add buff to buffs.
 *
 * @param {Buff} buff
 * @api public
 */
Character.prototype.addBuff = function(buff) {
    this.buffs[buff.type] = buff;
};

/**
 * Remove buff from buffs.
 *
 * @param {Buff} buff
 * @api public
 */
Character.prototype.removeBuff = function(buff) {
    delete this.buffs[buff.type];
};
