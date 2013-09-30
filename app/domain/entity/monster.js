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
var ActiveSkill = require('./../activeSkill');
var PassiveSkill = require('./../passiveSkill');

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
    this.equipments = opts.equipments;

    var heros = dataApi.heros.data;
    //this.nextLevelExp = formula.calculateXpNeeded(heros[this.id]["xpNeeded"], heros[this.id]["levelFillRate"], this.level + 1);//hero.xpNeeded, hero.levelFillRate, level
    this.herosData = dataApi.heros.findById(this.kindId);
    this.range = opts.range || 2;

    this.initSkills();
    this.setTotalAttackAndDefence();

    this.fightValue = {
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        hp: this.hp,
        maxHp: this.maxHp,
        focus: this.focus,
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

Enemy.prototype.setTotalAttackAndDefence = function() {
    var attack = 0, defense = 0;

    for (var key in this.equipments) {
        var equip = dataApi.equipment.findById(this.equipments[key]);
        if (!!equip) {
            attack += Number(equip.attack);
            defense += Number(equip.defense);
        }
    }

    this.totalAttack = this.getAttackValue() + attack;
    this.totalDefense = this.getDefenseValue() + defense;
};

/**
 * Recover hp if not in fight state
 *
 */
Enemy.prototype.recover = function(lastTick){
    var time = Date.now();

    if(!this.isRecover){
        this.revocerWaitTime -= 100;
    }

    this.hp += (time - lastTime)/ this.maxHp;
    if(hp >= this.maxHp){
        this.hp == this.maxHp;

        this.isRecover = false;
    }
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
    this.fightValue.speedLevel = Math.floor(speedLevel);
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
        focusRate: this.focusRate,
        dodgeRate: this.dodgeRate,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counterAttack: this.counterAttack,//反击
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

Enemy.prototype.setEquipments = function(equipments){
    this.equipments = equipments;
    this.setTotalAttackAndDefence();
}

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
        focusRate: this.focusRate,
        dodgeRate: this.dodgeRate,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counterAttack: this.counterAttack,//反击
        skills: this.skills,
        buffs: this.buffs
    };
};
