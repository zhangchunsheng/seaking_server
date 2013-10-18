/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-06
 * Description: opponent
 */
var util = require('util');
var Player = require('./player');
var EntityType = require('../../consts/consts').EntityType;

/**
 * Initialize a new 'Opponent' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Opponent = function(opts) {
    Player.call(this, opts);
    this.type = EntityType.OPPONENT;
};

util.inherits(Opponent, Player);

module.exports = Opponent;

Opponent.prototype.update = function(field, value) {
    this[field] = value;
}

/**
 * strip
 * @returns obj
 */
Opponent.prototype.strip = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        equipments: this.equipmentsEntity.getInfo(),
        skills: this.skills,
        buffs: this.buffs
    };
};

Opponent.prototype.toJSON = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        equipments: this.equipmentsEntity.getInfo(),
        skills: this.skills,
        buffs: this.buffs
    };
};
