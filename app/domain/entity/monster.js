/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-01
 * Description: monster
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var Character = require('./character');
var skillDao = require('../../dao/skillDao');
var ActiveSkill = require('./../skill/activeSkill');
var PassiveSkill = require('./../skill/passiveSkill');

/**
 * Initialize a new 'Enemy' with the given 'opts'.
 * Enemy inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Enemy = function(opts) {
    Character.call(this, opts);
    this.id = opts.id;
    this.type = EntityType.MONSTER;

    this.range = opts.range || 2;

    this.initSkills();

    this.fightValue = {
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        hp: this.hp,
        maxHp: this.maxHp,
        focus: this.focus,
        sunderArmor: this.sunderArmor,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        dodge: this.dodge,
        block: this.block,
        counter: this.counter
    };
};

util.inherits(Enemy, Character);

/**
 * Expose 'Enemy' constructor.
 */
module.exports = Enemy;

Enemy.prototype.initSkills = function() {

};

/**
 * 计算战斗数值
 */
Enemy.prototype.updateFightValue = function() {
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
    var equipments;
    var equipment;
    //集中值 武器百分比 技能百分比 buff百分比
    //武器攻击力 技能攻击力 道具攻击力 buff攻击力
    attack = this.attack + this.attack * this.focus;
    defense = this.defense;
    speedLevel = this.speedLevel;
    hp = this.hp;
    focus = this.focus;
    criticalHit = this.criticalHit;
    critDamage = this.critDamage;
    dodge = this.dodge;
    block = this.block;
    counter = this.counter;

    this.fightValue.attack = Math.floor(attack);
    this.fightValue.defense = Math.floor(defense);
    this.fightValue.speedLevel = speedLevel;
    this.fightValue.hp = hp;
    this.fightValue.maxHp = hp;
    this.fightValue.focus = focus;
    this.fightValue.criticalHit = criticalHit;
    this.fightValue.critDamage = critDamage;
    this.fightValue.dodge = dodge;
    this.fightValue.block = block;
    this.fightValue.counter = counter;
};

Enemy.prototype.updateRestoreAngerSpeed = function() {

}

Enemy.prototype.calculateBuff = function() {
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
    var equipments;
    var equipment;
    //集中值 武器百分比 技能百分比 buff百分比
    //武器攻击力 技能攻击力 道具攻击力 buff攻击力
    attack = this.fightValue.attack;
    defense = this.fightValue.defense;
    speedLevel = this.fightValue.speedLevel;
    hp = this.fightValue.hp;
    focus = this.fightValue.focus;
    criticalHit = this.fightValue.criticalHit;
    critDamage = this.fightValue.critDamage;
    dodge = this.fightValue.dodge;
    block = this.fightValue.block;
    counter = this.fightValue.counter;

    this.fightValue.attack = Math.floor(attack);
    this.fightValue.defense = Math.floor(defense);
    this.fightValue.speedLevel = speedLevel;
    this.fightValue.hp = hp;
    this.fightValue.maxHp = hp;
    this.fightValue.focus = focus;
    this.fightValue.criticalHit = criticalHit;
    this.fightValue.critDamage = critDamage;
    this.fightValue.dodge = dodge;
    this.fightValue.block = block;
    this.fightValue.counter = counter;
}

//Convert player' state to json and return
Enemy.prototype.strip = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        x: Math.floor(this.x),
        y: Math.floor(this.y),
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        currentScene: this.currentScene,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        skills: this.skills,
        buffs: this.buffs
    };
};

/**
 * Get the whole information of player, contains tasks, package, equipments information.
 *
 *	@return {Object}
 *	@api public
 */
Enemy.prototype.getInfo = function() {
    var playerData = this.strip();
    playerData.equipments = this.equipments;

    return playerData;
};

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Enemy.prototype.toJSON = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        x: Math.floor(this.x),
        y: Math.floor(this.y),
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        currentScene: this.currentScene,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        skills: this.skills,
        buffs: this.buffs
    };
};

Enemy.prototype.getBaseInfo = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        x: Math.floor(this.x),
        y: Math.floor(this.y),
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        currentScene: this.currentScene,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        skills: this.skills,
        buffs: this.buffs
    };
};
