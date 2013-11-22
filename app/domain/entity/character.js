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
var util = require('util');
var utils = require('../../utils/utils');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var Entity = require('./entity');

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
    this.starLevel = opts.starLevel;
    this.heroType = opts.heroType;//英雄类型
    this.sunderArmor = opts.sunderArmor;//破甲
    this.hp = opts.hp;
    this.anger = opts.anger || 0;// 能量值
    this.maxHp = opts.maxHp;
    this.maxAnger = opts.maxAnger || 100;// 最大能量值
    this.restoreHpSpeed = opts.restoreHpSpeed || 10;//生命值恢复速度
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
    this.critDamage = opts.critDamage || 1.6;//暴击
    this.counter = opts.counter;//反击

    this.addHp = opts.addHp;//生命成长值
    this.addAttack = opts.addAttack;//攻击成长值

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

    this.hpRecoverySpeed = 1;

    this.formationId = opts.formationId;

    this.attackParam = 1;
    this.defenseParam = 1;
    this.equipmentParam = 1;
    this.characterData = dataApi.character.findById(this.cId);
    this.skills = opts.skills;

    this.activeSkill = {};
    this.activeSkills = [];
    this.passiveSkills = [];

    this.restoreAngerSpeed = opts.restoreAngerSpeed || {ea:10, ehr: 3, eshr: 6};//能量恢复速度

    this.hasBuff = false;
    this.buffs = opts.buffs || [];
    this.skillBuffs = [];//技能buff

    this.hasUpgrade = false;
};

util.inherits(Character, Entity);

/**
 * Expose 'Character' constructor.
 */
module.exports = Character;

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
    this.buffs.push(buff);
};

/**
 * Remove buff from buffs.
 *
 * @param {Buff} buff
 * @api public
 */
Character.prototype.removeBuff = function(buff) {

};

Character.prototype.addAttack = function(value) {
    this.attack += parseInt(value);
};

Character.prototype.reduceAttack = function(value) {
    this.attack -= parseInt(value);
};

Character.prototype.addDefense = function(value) {
    this.defense += parseInt(value);
};

Character.prototype.reduceDefense = function(value) {
    this.defense -= parseInt(value);
};

Character.prototype.addSpeedLevel = function(value) {
    this.speedLevel += parseInt(value);
};

Character.prototype.reduceSpeedLevel = function(value) {
    this.speedLevel -= parseInt(value);
};

Character.prototype.addHp = function(value) {
    this.hp += parseInt(value);
};

Character.prototype.reduceHp = function(value) {
    this.hp -= parseInt(value);
};

Character.prototype.addMaxHp = function(value) {
    this.maxHp += parseInt(value);
};

Character.prototype.reduceMaxHp = function(value) {
    this.maxHp -= parseInt(value);
};

Character.prototype.addFocus = function(value) {
    this.focus += parseInt(value);
};

Character.prototype.reduceFocus = function(value) {
    this.focus -= parseInt(value);
};

Character.prototype.addCriticalHit = function(value) {
    this.criticalHit += parseInt(value);
};

Character.prototype.reduceCriticalHit = function(value) {
    this.criticalHit -= parseInt(value);
};

Character.prototype.addCritDamage = function(value) {
    this.critDamage += parseInt(value);
};

Character.prototype.reduceCritDamage = function(value) {
    this.critDamage -= parseInt(value);
};

Character.prototype.addDodge = function(value) {
    this.dodge += parseInt(value);
};

Character.prototype.reduceDodge = function(value) {
    this.dodge -= parseInt(value);
};

Character.prototype.addBlock = function(value) {
    this.block += parseInt(value);
};

Character.prototype.reduceBlock = function(value) {
    this.block -= parseInt(value);
};

Character.prototype.addCounter = function(value) {
    this.counter += parseInt(value);
};

Character.prototype.reduceCounter = function(value) {
    this.counter -= parseInt(value);
};

Character.prototype.addValue = function(attrName, value) {
    this[attrName] += parseInt(value);
};

Character.prototype.reduceValue = function(attrName, value) {
    this[attrName] -= parseInt(value);
};

