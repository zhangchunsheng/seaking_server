/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-24
 * Description: partner
 */
var util = require('util');
var Player = require('./player');
var EntityType = require('../../consts/consts').EntityType;

/**
 * Initialize a new 'Partner' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Partner = function(opts) {
    Player.call(this, opts);
    this.type = EntityType.PARTNER;
};

util.inherits(Partner, Player);

module.exports = Partner;

Partner.prototype.update = function(field, value) {
    this[field] = value;
}

/**
 * strip
 * @returns obj
 */
Partner.prototype.strip = function() {
    return {
        ZX:this.ZX,
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        heroId: this.herosData.heroId,
        type: this.type,
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        trait: this.trait,
        starLevel: this.starLevel,
        starLevelExperience: this.starLevelExperience,
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
        //skills: this.skills,
        currentSkills: this.currentSkills,
        buffs: this.buffs,
        ghost: this.ghostEntity.getInfo(),
        aptitude: this.aptitudeEntity.getInfo()
    };
};

Partner.prototype.toJSON = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        heroId: this.herosData.heroId,
        type: this.type,
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        trait: this.trait,
        starLevel: this.starLevel,
        starLevelExperience: this.starLevelExperience,
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
        //skills: this.skills,
        currentSkills: this.currentSkills,
        buffs: this.buffs,
        ghost: this.ghostEntity.getInfo(),
        aptitude: this.aptitudeEntity.getInfo()
    };
};