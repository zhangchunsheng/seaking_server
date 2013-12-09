/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: player
 */
/**
 * Module dependencies
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var TaskType = require('../../consts/consts').TaskType;
var TaskStatus = require('../../consts/consts').TaskStatus;
var Character = require('./character');
var userDao = require('../../dao/userDao');
var playerDao = require('../../dao/playerDao');
var skillDao = require('../../dao/skillDao');
var taskDao = require('../../dao/taskDao');
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var ucenter = require('../../lib/ucenter/ucenter');
var ActiveSkill = require('./../skill/activeSkill');
var PassiveSkill = require('./../skill/passiveSkill');
var Buff = require('./../buff');
var skillUtil = require('../../utils/skillUtil');

/**
 * Initialize a new 'Player' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Player = function(opts) {
    Character.call(this, opts);
    this.id = opts.id;
    this.type = EntityType.PLAYER;
    this.userId = opts.userId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.nickname = opts.nickname;
    this.equipments = opts.equipments;
    this.package = opts.package;
    this.formation = opts.formation;
    this.partners = opts.partners;
    this.gift = opts.gift;

    var heros = dataApi.heros.data;
    //this.nextLevelExp = formula.calculateAccumulated_xp(heros[this.cId]["xpNeeded"], heros[this.cId]["levelFillRate"], this.level + 1);//hero.xpNeeded, hero.levelFillRate, level
    this.nextLevelExp = opts.nextLevelExp;
    this.herosData = dataApi.herosV2.findById(this.kindId);//heros
    this.curTasks = opts.curTasks;
    this.range = opts.range || 2;

    this.currentScene = opts.currentScene;
    this.currentIndu = opts.currentIndu;

    this.serverId = opts.serverId;
    this.sid = opts.serverId;
    this.regionId = opts.serverId;

    this.money = opts.money;
    this.gameCurrency = opts.gameCurrency;

    this.curTasksEntity = opts.curTasksEntity;
    this.equipmentsEntity = opts.equipmentsEntity;
    this.packageEntity = opts.packageEntity;

    this.showCIds = opts.showCIds || {"stage":opts.cId};

    this.pushMessage = opts.pushMessage || [];

    this.fightValue = {
        attackType: this.attackType,
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

    this.initSkills();
    this.updateRestoreAngerSpeed();
};

util.inherits(Player, Character);

/**
 * Expose 'Player' constructor.
 */
module.exports = Player;

//Add experience
Player.prototype.addExperience = function(exp) {
    this.experience += parseInt(exp);
    if (this.experience >= this.nextLevelExp) {
        this.upgrade();
    }
    this.save();
};

//Add experience
Player.prototype.addExp = function(exp) {
    this.experience += parseInt(exp);
    if (this.experience >= this.nextLevelExp) {
        this.upgrade();
    }
};

/**
 * 更新血量
 * @param hp
 */
Player.prototype.updateHP = function(cb) {
    userDao.updatePlayer(this, "hp", cb);
}

/**
 * Upgrade and update the player's state
 * when it upgrades, the state such as hp, mp, defense etc will be update
 * emit the event 'upgrade'
 *
 * @api public
 */
Player.prototype.upgrade = function() {
    var upgradeColumn = {};
    this.hasUpgrade = true;
    while (this.experience >= this.nextLevelExp) {
        upgradeColumn = this._upgrade();
    }
    var that = this;
    userDao.upgrade(this, upgradeColumn, function(err, reply) {
        //that.updateAttribute();
        that.emit('upgrade');//pushMessage
    });
};

//Upgrade, update player's state
Player.prototype._upgrade = function() {
    this.level += 1;
    var level = this.level;
    var hero = dataApi.heros.findById(this.cId);
    var upgradeColumn = {
        level: level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), level)
    }
    this.setNextLevelExp();
    return upgradeColumn;
};

Player.prototype.setNextLevelExp = function() {
    var hero = dataApi.heros.findById(this.cId);
    this.nextLevelExp = formula.calculateAccumulated_xp(hero["xpNeeded"], hero["levelFillRate"], this.level + 1);//hero.xpNeeded, hero.levelFillRate, level
}

Player.prototype.getUpgradeInfo = function() {
    return {
        level: this.level,
        needExp: this.needExp,
        accumulated_xp: this.accumulated_xp,
        hp: this.hp,
        maxHp: this.maxHp,
        attack: this.attack,
        defense: this.defense,
        focus: this.focus,
        sunderArmor: this.sunderArmor,
        speedLevel: this.speedLevel,
        speed: this.speed,
        dodge: this.dodge,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,
        counter: this.counter,
        nextLevelExp: this.nextLevelExp
    }
}

Player.prototype.updateAttribute = function() {
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

    equipments = this.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            // equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid);
            if(typeof equipment == "undefined")
                continue;
            if(equipment.attackPercentage != 0)
                attack += this.attack * equipment.attackPercentage;
            if(equipment.defensePercentage != 0)
                defense += this.defense * equipment.defensePercentage;
            if(equipment.speedLevelPercentage != 0)
                speedLevel += this.speedLevel * equipment.speedLevelPercentage;
            if(equipment.hpPercentage != 0)
                hp += this.hp * equipment.hpPercentage;

            attack += equipment.attack;
            defense += equipment.defense;
            speedLevel += equipment.speedLevel;
            hp += equipment.hp;
            focus += equipment.focus;
            criticalHit += equipment.criticalHit;
            critDamage += equipment.critDamage;
            dodge += equipment.dodge;
            block += equipment.block;
            counter += equipment.counter;
        }
    }

    this.attack = Math.floor(attack);
    this.defense = Math.floor(defense);
    this.speedLevel = Math.floor(speedLevel);
    this.hp = hp;
    this.maxHp = hp;
    this.focus = focus;
    this.criticalHit = criticalHit;
    this.critDamage = critDamage;
    this.dodge = dodge;
    this.block = block;
    this.counter = counter;
};

/**
 * 初始化技能
 */
Player.prototype.initSkills = function() {
    if(typeof this.skills.currentSkill == "undefined")
        return;
    this.activeSkill = new ActiveSkill({
        skillId: this.skills.currentSkill.skillId
    });
    for(var i = 0 ; i < this.skills.passiveSkills.length ; i++) {
        if(this.skills.passiveSkills[i].status == 1) {
            this.passiveSkills.push(new PassiveSkill({
                skillId: this.skills.passiveSkills[i].skillId
            }));
        }
    }
    this.updateSkillBuffs();
};

/**
 * 更新技能buff
 */
Player.prototype.updateSkillBuffs = function() {
    var effects = {};
    for(var i = 0 ; i < this.passiveSkills.length ; i++) {
        effects = this.passiveSkills[i].skillData.effects;
        for(var j = 0 ; j < effects.length ; j++) {
            if(effects[j].attr == consts.effectName.HPRECOVERYSPEED) {//血量回复速度
                if(effects[j].valueType == consts.valueType.PERCENTAGE)
                    this.hpRecoverySpeed += this.hpRecoverySpeed * effects[j].value / 100;
            }
        }
    }
};

/**
 * 计算战斗数值
 */
Player.prototype.updateFightValue = function() {
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
    // attack = this.attack + this.attack * this.focus;
    defense = this.defense;
    speedLevel = this.speedLevel;
    hp = this.hp;
    focus = this.focus;
    criticalHit = this.criticalHit;
    critDamage = this.critDamage;
    dodge = this.dodge;
    block = this.block;
    counter = this.counter;

    //被动技能加成 被动技能buff
    var effects = {};
    for(var i = 0 ; i < this.passiveSkills.length ; i++) {
        effects = this.passiveSkills[i].skillData.effects;
        for(var j = 0 ; j < effects.length ; j++) {
            if(effects[j].attr == consts.effectName.ATTACK) {
                attack += utils.getEffectValue(effects[j], this.attack);
            } else if(effects[j].attr == consts.effectName.ADDATTACK) {
                attack += utils.getEffectValue(effects[j], this.attack);
            } else if(effects[j].attr == consts.effectName.DEFENSE) {
                defense += utils.getEffectValue(effects[j], this.defense);
            } else if(effects[j].attr == consts.effectName.SPEED) {
                speedLevel += utils.getEffectValue(effects[j], this.speedLevel);
            } else if(effects[j].attr == consts.effectName.HP) {
                hp += utils.getEffectValue(effects[j], this.hp);
            } else if(effects[j].attr == consts.effectName.FOCUS) {
                focus += utils.getEffectValue(effects[j], this.focus);
            } else if(effects[j].attr == consts.effectName.CRITICALHIT) {
                criticalHit += utils.getEffectValue(effects[j], this.criticalHit);
            } else if(effects[j].attr == consts.effectName.CRITDAMAGE) {
                critDamage += utils.getEffectValue(effects[j], this.critDamage);
            } else if(effects[j].attr == consts.effectName.DODGE) {
                dodge += utils.getEffectValue(effects[j], this.dodge);
            } else if(effects[j].attr == consts.effectName.BLOCK) {
                block += utils.getEffectValue(effects[j], this.block);
            } else if(effects[j].attr == consts.effectName.COUNTER) {
                counter += utils.getEffectValue(effects[j], this.counter);
            } else if(effects[j].attr == consts.effectName.ATTACK_FOCUS) {//攻击力focus加成
                attack += utils.getEffectFocusValue(effects[j], this.attack, this.focus);
            } else if(effects[j].attr == consts.effectName.DEFENSE_FOCUS) {//防御力focus加成
                defense += utils.getEffectFocusValue(effects[j], this.defense, this.focus);
            } else if(effects[j].attr == consts.effectName.BLOCK_FOCUS) {//格挡focus加成
                block += utils.getEffectFocusValue(effects[j], this.block, this.focus);
            } else if(effects[j].attr == consts.effectName.COUNTER_FOCUS) {//反击focus加成
                counter += utils.getEffectFocusValue(effects[j], this.counter, this.focus);
            } else if(effects[j].attr == consts.effectName.CRITICALHIT_FOCUS) {//暴击focus加成
                attack += utils.getEffectFocusValue(effects[j], this.attack, this.focus);
            } else if(effects[j].attr == consts.effectName.SKILL) {//技能处理
                var buff = skillUtil.getPassiveSkillBuff(effects[j], this.passiveSkills[i]);
                this.addBuff(buff);
            } else if(effects[j].attr == consts.effectName.EXPERIENCE) {//额外经验
                var buff = skillUtil.getPassiveSkillBuff(effects[j], this.passiveSkills[i]);
                this.addBuff(buff);
            } else if(effects[j].attr == consts.effectName.MONEY) {//额外金币
                var buff = skillUtil.getPassiveSkillBuff(effects[j], this.passiveSkills[i]);
                this.addBuff(buff);
            } else if(effects[j].id == "XG042111" || effects[j].id == "XG042121" || effects[j].id == "XG042131" || effects[j].id == "XG042141") {// 武器防御加成

            } else {

            }
        }
    }

    equipments = this.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            // equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid);
            if(typeof equipment == "undefined")
                continue;
            if(equipment.attackPercentage != 0)
                attack += this.attack * equipment.attackPercentage;
            if(equipment.defensePercentage != 0)
                defense += this.defense * equipment.defensePercentage;
            if(equipment.speedLevelPercentage != 0)
                speedLevel += this.speedLevel * equipment.speedLevelPercentage;
            if(equipment.hpPercentage != 0)
                hp += this.hp * equipment.hpPercentage;

            attack += equipment.attack;
            defense += equipment.defense;
            speedLevel += equipment.speedLevel;
            hp += equipment.hp;
            focus += equipment.focus;
            criticalHit += equipment.criticalHit;
            critDamage += equipment.critDamage;
            dodge += equipment.dodge;
            block += equipment.block;
            counter += equipment.counter;
        }
    }

    attack = this.attack + attack + this.attack * focus;

    //主动技能加成
    if(this.anger >= this.maxAnger) {

    }

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

/**
 * 计算战斗数值
 */
Player.prototype.updateFightValueV2 = function() {
    var attack = 0;
    var defense = 0;
    var speedLevel = 0;
    var hp = 0;
    var maxHp = 0;
    var focus = 0;
    var sunderArmor = 0;
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
    // attack = this.attack + this.attack * this.focus;
    defense = this.defense;
    speedLevel = this.speedLevel;
    hp = this.hp;
    maxHp = this.maxHp;
    focus = this.focus;
    sunderArmor = this.sunderArmor;
    criticalHit = this.criticalHit;
    critDamage = this.critDamage;
    dodge = this.dodge;
    block = this.block;
    counter = this.counter;

    attack = this.attack + attack;

    this.fightValue.attack = Math.floor(attack);
    this.fightValue.defense = Math.floor(defense);
    this.fightValue.speedLevel = speedLevel;
    this.fightValue.hp = hp;
    this.fightValue.maxHp = maxHp;
    this.fightValue.focus = focus;
    this.fightValue.sunderArmor = sunderArmor;
    this.fightValue.criticalHit = criticalHit;
    this.fightValue.critDamage = critDamage;
    this.fightValue.dodge = dodge;
    this.fightValue.block = block;
    this.fightValue.counter = counter;

    this.fight.reduceDamage = 0;//减免伤害
    this.fight.reduceDamageValue = 0;
};

/**
 * 获得怒气数值
 */
Player.prototype.updateRestoreAngerSpeed = function() {
    if(typeof this.activeSkill.skillData == "undefined")
        return;
    var speed = this.activeSkill.skillData.speed;
    for(var i = 0 ; i < speed.length ; i++) {
        this.restoreAngerSpeed[speed[i].type] = parseInt(speed[i].value);
    }
}

/**
 * 武器装备加成
 */
Player.prototype.equipmentAdditional = function() {
    var attack = 0;
    var defense = 0;
    var speedLevel = 0;
    var hp = 0;
    var focus = 0;
    var sunderArmor = 0;
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

    defense = this.defense;
    speedLevel = this.speedLevel;
    hp = this.hp;
    focus = this.focus;
    sunderArmor = this.sunderArmor;
    criticalHit = this.criticalHit;
    critDamage = this.critDamage;
    dodge = this.dodge;
    block = this.block;
    counter = this.counter;

    equipments = this.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            // equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid);
            if(typeof equipment == "undefined")
                continue;
            if(equipment.attackPercentage != 0)
                attack += this.attack * equipment.attackPercentage;
            if(equipment.defensePercentage != 0)
                defense += this.defense * equipment.defensePercentage;
            if(equipment.speedLevelPercentage != 0)
                speedLevel += this.speedLevel * equipment.speedLevelPercentage;
            if(equipment.hpPercentage != 0)
                hp += this.hp * equipment.hpPercentage;

            attack += equipment.attack;
            defense += equipment.defense;
            speedLevel += equipment.speedLevel;
            hp += equipment.hp;
            focus += equipment.focus;
            criticalHit += equipment.criticalHit;
            critDamage += equipment.critDamage;
            dodge += equipment.dodge;
            block += equipment.block;
            counter += equipment.counter;
        }
    }
    attack = this.attack + attack + this.attack * this.focus;

    this.fightValue.attack = Math.floor(attack);
    this.fightValue.defense = Math.floor(defense);
    this.fightValue.speedLevel = speedLevel;
    this.fightValue.hp = hp;
    this.fightValue.maxHp = hp;
    this.fightValue.focus = focus;
    this.fightValue.sunderArmor = sunderArmor;
    this.fightValue.criticalHit = criticalHit;
    this.fightValue.critDamage = critDamage;
    this.fightValue.dodge = dodge;
    this.fightValue.block = block;
    this.fightValue.counter = counter;
}

/**
 * 主动技能加成，主动技能持续回合或次数
 * 技能计算:目标 伤害等
 */
Player.prototype.activeSkillAdditional = function() {
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

    var effects = {};
    effects = this.activeSkill.skillData.effects;
    for(var j = 0 ; j < effects.length ; j++) {

    }

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

Player.prototype.useActiveSkill = function(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var effects = {};
    effects = this.activeSkill.skillData.effects;
    for(var j = 0 ; j < effects.length ; j++) {
        if(effects[j].attr == consts.effectName.ATTACK) {// 计算攻击力
            this.activeSkill.calculateAttack(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.ADDATTACK) {//给自己加攻击力
            this.activeSkill.calculateAddAttack(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.DEFENSE) {
            this.activeSkill.calculateDefense(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.SPEED) {//加速度，速度buff
            this.activeSkill.calculateSpeed(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.HP) {//加血，直接累加
            this.activeSkill.calculateHp(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.FOCUS) {
            this.activeSkill.calculateFocus(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.CRITICALHIT) {
            this.activeSkill.calculateCriticalHit(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.CRITDAMAGE) {
            this.activeSkill.calculateCritDamage(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.DODGE) {
            this.activeSkill.calculateDodge(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.BLOCK) {
            this.activeSkill.calculateBlock(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.COUNTER) {
            this.activeSkill.calculateCounter(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.BLOCK_FOCUS) {//格挡focus加成
            this.activeSkill.calculateBlockFocus(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.COUNTER_FOCUS) {//反击focus加成
            this.activeSkill.calculateCounterFocus(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.CRITICALHIT_FOCUS) {//暴击focus加成
            this.activeSkill.calculateCriticalHitFocus(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.PARALLELDAMAGE) {//溅射伤害
            //this.activeSkill.attack(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            this.activeSkill.parallelDamage(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[j].attr == consts.effectName.BURN) {//点燃
            //this.activeSkill.attack(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            this.activeSkill.burn(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);// buff 次数
        } else if(effects[j].attr == consts.effectName.STUNT) {//禁锢
            //this.activeSkill.attack(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            this.activeSkill.stunt(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);// buff 次数
        } else if(effects[j].attr == consts.effectName.POISON) {//施毒
            //this.activeSkill.attack(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            this.activeSkill.poison(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);// buff 次数 no anger
        } else if(effects[j].attr == consts.effectName.CONFUSION) {//迷惑
            //this.activeSkill.attack(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            this.activeSkill.confusion(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);// buff 次数
        } else if(effects[j].attr == consts.effectName.HPRECOVERYSPEED) {//血量回复速度，buff

        } else if(effects[j].attr == consts.effectName.ADDITEMATTR) {//装备加成

        } else if(effects[j].attr == consts.effectName.BOUNCEATTACK) {//反弹伤害
            this.activeSkill.bounceAttack(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData); // buff 次数
        } else if(effects[j].attr == consts.effectName.ADDBLOOD) {//吸血
            this.activeSkill.addBlood(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);// 计算数值
        } else if(effects[j].attr == consts.effectName.ICE) {//冰冻
            this.activeSkill.ice(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        } else if(effects[i].attr == consts.effectName.REVIVE) {
            this.activeSkill.revive(effects[j], attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);// 复活 buff 次数
        }
    }
}

Player.prototype.calculateBuff = function() {
    var attack = 0;
    var defense = 0;
    var speedLevel = 0;
    var hp = 0;
    var maxHp = 0;
    var focus = 0;
    var sunderArmor = 0;
    var criticalHit = 0;
    var critDamage = 0;
    var dodge = 0;
    var block = 0;
    var counter = 0;
    var counterDamage = 0;
    //集中值 武器百分比 技能百分比 buff百分比
    //武器攻击力 技能攻击力 道具攻击力 buff攻击力
    attack = this.fightValue.attack;
    defense = this.fightValue.defense;
    speedLevel = this.fightValue.speedLevel;
    hp = this.fightValue.hp;
    maxHp = this.fightValue.maxHp;
    focus = this.fightValue.focus;
    sunderArmor = this.fightValue.sunderArmor;
    criticalHit = this.fightValue.criticalHit;
    critDamage = this.fightValue.critDamage;
    dodge = this.fightValue.dodge;
    block = this.fightValue.block;
    counter = this.fightValue.counter;

    this.fightValue.attack = Math.floor(attack);
    this.fightValue.defense = Math.floor(defense);
    this.fightValue.speedLevel = speedLevel;
    this.fightValue.hp = hp;
    this.fightValue.maxHp = maxHp;
    this.fightValue.focus = focus;
    this.fightValue.sunderArmor = sunderArmor;
    this.fightValue.criticalHit = criticalHit;
    this.fightValue.critDamage = critDamage;
    this.fightValue.dodge = dodge;
    this.fightValue.block = block;
    this.fightValue.counter = counter;

    this.fight.reduceDamage = 0;//减免伤害
    this.fight.reduceDamageValue = 0;
    this.fight.addDefense = 0;
    this.fight.addDefenseValue = 0;
    this.fight.addAttack = 0;
    this.fight.addAttackValue = 0;
    this.fight.addSunderArmor = 0;
    this.fight.addSunderArmorValue = 0;
    this.fight.addHp = 0;
    this.fight.addHpValue = 0;
    this.fight.promoteHp = 0;
    this.fight.promoteHpValue = 0;
    this.fight.addDodge = 0;
    this.fight.addDodgeValue = 0;
    this.fight.ice = false;
    this.fight.silence = false;
}

/**
 * 被动技能加成
 */
Player.prototype.passiveSkillAdditional = function() {
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

    var effects = {};
    for(var i = 0 ; i < this.passiveSkills.length ; i++) {
        effects = this.passiveSkills[i].skillData.effects;
        for(var j = 0 ; j < effects.length ; j++) {
            if(effects[j].attr == consts.effectName.EXPERIENCE) {//加经验，经验buff

            } else if(effects[j].attr == consts.effectName.ATTACK) {
                attack += utils.getEffectValue(effects[j], this.attack);
            } else if(effects[j].attr == consts.effectName.ADDATTACK) {//给自己加攻击力
                attack += utils.getEffectValue(effects[j], this.attack);
            } else if(effects[j].attr == consts.effectName.DEFENSE) {
                defense += utils.getEffectValue(effects[j], this.defense);
            } else if(effects[j].attr == consts.effectName.SPEED) {//加速度，速度buff
                speedLevel += utils.getEffectValue(effects[j], this.speedLevel);
            } else if(effects[j].attr == consts.effectName.HP) {//加血，直接累加
                hp += utils.getEffectValue(effects[j], this.hp);
            } else if(effects[j].attr == consts.effectName.FOCUS) {
                focus += utils.getEffectValue(effects[j], this.focus);
            } else if(effects[j].attr == consts.effectName.CRITICALHIT) {
                criticalHit += utils.getEffectValue(effects[j], this.criticalHit);
            } else if(effects[j].attr == consts.effectName.CRITDAMAGE) {
                critDamage += utils.getEffectValue(effects[j], this.critDamage);
            } else if(effects[j].attr == consts.effectName.DODGE) {
                dodge += utils.getEffectValue(effects[j], this.dodge);
            } else if(effects[j].attr == consts.effectName.BLOCK) {
                block += utils.getEffectValue(effects[j], this.block);
            } else if(effects[j].attr == consts.effectName.COUNTER) {
                counter += utils.getEffectValue(effects[j], this.counter);
            } else if(effects[j].attr == consts.effectName.PARALLELDAMAGE) {//溅射伤害

            } else if(effects[j].attr == consts.effectName.BURN) {//点燃

            } else if(effects[j].attr == consts.effectName.STUNT) {//禁锢

            } else if(effects[j].attr == consts.effectName.POISON) {//施毒

            } else if(effects[j].attr == consts.effectName.CONFUSION) {//迷惑

            } else if(effects[j].attr == consts.effectName.DEFENSE_FOCUS) {//防御力focus加成

            } else if(effects[j].attr == consts.effectName.HPRECOVERYSPEED) {//血量回复速度，buff

            } else if(effects[j].attr == consts.effectName.ADDITEMATTR) {//装备加成

            } else if(effects[j].attr == consts.effectName.BOUNCEATTACK) {//反弹伤害

            } else if(effects[j].attr == consts.effectName.MONEY) {//额外金币，buff

            } else if(effects[j].attr == consts.effectName.ADDBLOOD) {//吸血

            } else if(effects[j].attr == consts.effectName.ATTACK_FOCUS) {//攻击力focus加成

            } else if(effects[j].attr == consts.effectName.SKILL) {//技能加成

            } else if(effects[j].attr == consts.effectName.ICE) {//冰冻

            } else if(effects[j].attr == consts.effectName.BLOCK_FOCUS) {//格挡focus加成

            } else if(effects[j].attr == consts.effectName.COUNTER_FOCUS) {//反击focus加成

            } else if(effects[j].attr == consts.effectName.CRITICALHIT_FOCUS) {//暴击focus加成

            }
        }
    }

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

/**
 * Equip equipment.
 *
 * @param {String} pkgType
 * @param {Number} equipId
 * @api public
 */
Player.prototype.equip = function(pkgType, item, pIndex, player) {
    var index = 0;
    var epType = utils.getEqType(item.itemId);

    var curEquipment = this.equipmentsEntity.get(epType);
    this.equipmentsEntity.equip(epType, {
        epid: item.itemId,
        level: item.level
    });

    if (curEquipment.epid != 0) {
        index = player.packageEntity.addItem(this, pkgType, {
            itemId: curEquipment.epid,
            itemNum: 1,
            level: curEquipment.level
        }, pIndex).index;
    } else {
        //player.packageEntity.removeItem(pkgType, pIndex);
        player.packageEntity.removeItem(pIndex, 1);
    }
    //this.updateAttribute();

    return index;
};

Player.prototype.buyItem = function(type, item, costMoney) {
    var packageChange = this.packageEntity.addItem(this, type, item).index;

    if(packageChange.length != 0) {
        this.money = this.money - costMoney;
        this.save();
    }
    return {
        money: this.money,
        packageChange: packageChange
    }
}

/**
 * Unequip equipment by type.
 *
 * @param {Number} type
 * @api public
 */
Player.prototype.unEquip = function(type) {
    this.equipmentsEntity.unEquip(type);
    //this.updateAttribute();
};

/**
 * Use Item
 *
 * @param {Number} index
 * @return {Boolean}
 * @api public
 */
Player.prototype.useItem = function(type, index) {
    var item = this.packageEntity.get(type, index);
    if (!item || !item.itemId.match(/D/)) {
        return false;
    }
    this.packageEntity.removeItem(type, index);
    return true;
};

/**
 *
 * @param skillId
 */
Player.prototype.checkSkill = function(skillId) {
    var realSkillId = "";
    var type = "";

    realSkillId = skillId.substr(0, 6);
    type = skillId.substr(4, 1);//SK01111

    type = consts.correspondingSkillsType[type];

    var skills = this.skills[type];
    var flag = false;
    for(var i = 0 ; i < skills.length ; i++) {
        if(skills[i].skillId.substr(0, 6) == realSkillId) {
            flag = true;
            if(skills[i].status == 1) {
                return 0;
            } else {
                return 1;
            }
        }
    }
    if(!flag) {
        return -1;
    }

    return -1;
}

Player.prototype.checkSkillUpgrade = function(skillId) {
    var realSkillId = "";
    var type = "";
    var level = 0;

    realSkillId = skillId.substr(0, 6);
    type = skillId.substr(4, 1);//SK01111
    level = skillId.substr(6, 1);

    type = consts.correspondingSkillsType[type];

    var flag = false;
    var skills = this.skills[type];
    for(var i = 0 ; i < skills.length ; i++) {
        if(skills[i].skillId.substr(0, 6) == realSkillId) {
            if(skills[i].status == 0) {
                return 0;
            }
            if(level < skills[i].skillId.substr(6, 1)) {
                return -2;
            }
            if(level > skills[i].skillId.substr(6, 1)) {
                return -3;
            }
            if(dataApi.skillList.findById(skillId).nextSkillId == "") {//最高等级
                return -1;
            }
            flag = true;
            break;
        }
    }

    if(flag) {
        return 1;
    } else {
        return 0;
    }
}

Player.prototype.checkUseSkill = function(skillId) {
    var type = "";

    type = skillId.substr(4, 1);//SK01111

    type = consts.correspondingSkillsType[type];

    var skills = this.skills[type];
    for(var i = 0 ; i < skills.length ; i++) {
        if(skills[i].skillId == skillId) {
            if(skills[i].status == 1) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    return -1;
}

/**
 * Learn a new skill.
 *
 * @param {Number} skillId
 * SK代表技能编号
 * 第1,2位表示英雄编号
 * 第3位表示技能类型
 * 1表示主动技能
 * 2表示被动技能
 * 第4位表示技能编号
 * 第5位表示技能等级
 * @param {Function} callback
 * @return {Blooean}
 * @api public
 */
Player.prototype.learnSkill = function(skillId, callback) {
    var realSkillId = "";
    var type = "";

    realSkillId = skillId.substr(0, 6);

    var skillData = dataApi.skillList.findById(realSkillId + "1");
    var status = this.checkRequirement(skillData);

    if(status == 0) {
        utils.invokeCallback(callback, {}, 0);
        return;
    }

    type = skillId.substr(4, 1);//SK01111
    type = consts.correspondingSkillsType[type];
    var skills = this.skills[type];
    for(var i = 0 ; i < skills.length ; i++) {
        if(skills[i].skillId.substr(0, 6) == realSkillId) {
            skills[i].status = 1;
            break;
        }
    }

    var array = [];
    var characterId = utils.getRealCharacterId(this.id);
    var key = dbUtil.getPlayerKey(this.serverId, this.registerType, this.loginName, characterId);
    array.push(["hset", key, type, JSON.stringify(skills)]);
    userDao.update(array, function(err, repy) {
        utils.invokeCallback(callback, null, 1);
    });
};

/**
 * Upgrade the existing skill.
 *
 * @param {Number} skillId
 * @return {Boolean}
 * @api public
 */
Player.prototype.upgradeSkill = function(skillId, callback) {
    var type = "";

    type = skillId.substr(4, 1);//SK01111
    type = consts.correspondingSkillsType[type];
    var skills = this.skills[type];
    var skillData = dataApi.skillList.findById(skillId);
    var nextSkillId = skillData.nextSkillId;
    skillData = dataApi.skillList.findById(nextSkillId);

    var status = this.checkRequirement(skillData);

    if(status == 0) {
        utils.invokeCallback(callback, {}, 0);
        return;
    }

    for(var i = 0 ; i < skills.length ; i++) {
        if(skills[i].skillId == skillId) {
            skills[i].skillId = nextSkillId;
            break;
        }
    }

    var array = [];
    var characterId = utils.getRealCharacterId(this.id);
    var key = dbUtil.getPlayerKey(this.serverId, this.registerType, this.loginName, characterId);
    array.push(["hset", key, type, JSON.stringify(skills)]);
    userDao.update(array, function(err, repy) {
        utils.invokeCallback(callback, null, nextSkillId);
    });
};

Player.prototype.useSkill = function(skillId, callback) {
    var type = "";

    type = skillId.substr(4, 1);//SK01111
    type = consts.correspondingSkillsType[type];
    var skills = this.skills[type];

    var flag = false;
    var currentSkill = {};
    for(var i = 0 ; i < skills.length ; i++) {
        if(typeof skills[i].select != "" && skills[i].select == 1) {
            skills[i].select = 0;
        }
        if(skills[i].skillId == skillId) {
            flag = true;
            skills[i].select = 1;
            var date = new Date();
            currentSkill = {
                skillId: skillId,
                time: date.getTime()
            };
        }
    }

    if(!flag) {
        utils.invokeCallback(callback, {}, 0);
    }

    var array = [];
    var characterId = utils.getRealCharacterId(this.id);
    var key = dbUtil.getPlayerKey(this.serverId, this.registerType, this.loginName, characterId);
    array.push(["hset", key, type, JSON.stringify(skills)]);
    array.push(["hset", key, "currentSkill", JSON.stringify(currentSkill)]);
    userDao.update(array, function(err, repy) {
        utils.invokeCallback(callback, null, 1);
    });
};

/**
 *
 * @param skillData
 * @returns {number}
 */
Player.prototype.checkRequirement = function(skillData) {
    var status = 0;
    var requirement = skillData.requirement;
    if(requirement.length == 0)
        status = 1;
    var count = 0;
    for(var i = 0 ; i < requirement.length ; i++) {
        if(requirement[i].type == consts.requirementType.COINS) {
            if(this.money >= requirement[i].value) {
                this.money -= requirement[i].value;
                count++;
            } else {

            }

        } else if(requirement[i].type == consts.requirementType.ITEMS) {
            count++;
        } else if(requirement[i].type == consts.requirementType.LEVEL) {
            if(this.level >= requirement[i].value) {
                count++;
            } else {

            }
        } else if(requirement[i].type == consts.requirementType.SKILLS) {
            count++;
        } else {

        }
    }
    if(count == requirement.length)
        status = 1;
    return status;
}

// Emit the event 'save'.
Player.prototype.save = function() {
    this.emit('save');
};

Player.prototype.updatePlayer = function(field, cb) {
    userDao.updatePlayer(this, field, cb);
}

Player.prototype.updatePlayerAttribute = function(players, cb) {
    playerDao.updatePlayersAttribute(this, players, ["experience"], cb);
}

/**
 * Start task.
 * Start task after accept a task, and update the task' state, such as taskState, taskData, startTime
 *
 * @param {Task} task, new task to be implement
 * @api public
 */
Player.prototype.startTask = function(type, task) {
    task.status = TaskStatus.START_TASK;
    task.taskRecord = {
        itemNum: 0
    };
    task.startTime = formula.timestamp(new Date());
    task.pretreatmentTask(this);
    task.save();
    this.curTasksEntity[type] = task;
};

Player.prototype.getNextTask = function(type, task) {
    var nextTaskId = task.nextTaskId;
    if(type == consts.curTaskType.CURRENT_DAY_TASK) {
        if(this.curTasks[type].length > 1) {
            this.curTasks[type].shift();
            nextTaskId = this.curTasks[type][0].taskId;
        }
    }
    if(nextTaskId == null || nextTaskId == 0) {
        return false;
    }
    var date = new Date();
    var task = {
        "taskId": nextTaskId,
        "status": 0,
        "taskRecord": {"itemNum": 0},
        "startTime": date.getTime()
    };
    var characterId = utils.getRealCharacterId(this.id);
    task = taskDao.createNewTask(task, this.sid, this.registerType, this.loginName, characterId);
    this.curTasksEntity[type] = task;
    return true;
}

Player.prototype.updateTask = function() {
    userDao.updatePlayer(this, "curTasksEntity");
}

Player.prototype.updateTaskRecord = function(TaskGoalType, items) {
    var task = {};
    for(var type in this.curTasksEntity.strip()) {
        task = this.curTasksEntity[type];
        if(task.taskGoal.type == TaskGoalType) {
            task.updateRecord(this, TaskGoalType, items);
        }
    }
}

/**
 *
 */
Player.prototype.syncData = function() {

}

/**
 * Handover task.
 * Handover task after curTask is completed, and upgrade the tasks' state
 *
 * @param {Array} taskIds
 * @api public
 */
Player.prototype.handOverTask = function(taskIds) {
    var length = taskIds.length;
    var type = "";
    var date = new Date();
    var nextTasks = {};
    for (var i = 0; i < length; i++) {
        var type = taskIds[i];
        var task = this.curTasksEntity[type];
        task.status = TaskStatus.HANDOVERED;
        task.handOverTime = date.getTime();
        task.save();
        this.logTaskData(type);
        if(this.getNextTask(type, task)) {
            nextTasks[type] = task.getInfo();
        }
    }
    return nextTasks;
};

/**
 * Recover hp if not in fight state
 *
 */
Player.prototype.recover = function(lastTick){
    var time = Date.now();
};

//Complete task and tasks' state.
Player.prototype.completeTask = function(type) {
    var task = this.curTasksEntity[type];
    var date = new Date();
    task.status = TaskStatus.COMPLETED;
    task.finishTime = date.getTime();
    task.save();
};

Player.prototype.taskProgress = function(type) {
    var task = this.curTasksEntity[type];
    this.emit('taskProgress', task.taskInfo());//pushMessage
};

Player.prototype.logTaskData = function(type) {
    var task = this.curTasksEntity[type];
    // taskDao.savePlayerTaskData(this, task.logTask());
    ucenter.saveTaskLog(task.logTask());
}

//Convert player' state to json and return
Player.prototype.strip = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        showCIds: this.showCIds,
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
        currentIndu: this.currentIndu,
        focus: this.focus,
        sunderArmor: this.sunderArmor,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        curTasks: this.curTasksEntity.getInfo(),
        equipments: this.equipmentsEntity.getInfo(),
        package: this.packageEntity.getInfo(),
        skills: this.skills,
        buffs: this.buffs,
        formation: this.formation,
        partners: this.getPartners(),
        gift: this.gift
    };
};

Player.prototype.getUserInfo = function() {
    return {
        id: this.id,
        serverId: this.sid,
        registerType: this.registerType,
        loginName: this.loginName,
        nickname: this.nickname,
        currentScene: this.currentScene
    };
};

Player.prototype.updateColumn = function() {
    return {
        id: this.id,
        serverId: this.sid,
        registerType: this.registerType,
        loginName: this.loginName,
        columns : {
            experience: this.experience,
            money: this.money,
            hp: this.hp,
            buffs: this.buffs
        }
    };
};

Player.prototype.addMoney = function(money) {
    this.money += parseInt(money);
}

/**
 * Get the whole information of player, contains tasks, package, equipments information.
 *
 *	@return {Object}
 *	@api public
 */
Player.prototype.getInfo = function() {
    var playerData = this.strip();
    return playerData;
};

/**
 * getPartners
 */
Player.prototype.getPartners = function() {
    var array = [];
    for(var i = 0 ; i < this.partners.length ; i++) {
        array.push(this.partners[i].strip());
    }
    return array;
}

/**
 * getPartner
 */
Player.prototype.getPartner = function(playerId) {
    var partner = null;
    for(var i = 0, l = this.partners.length ; i < l ; i++) {
        if(this.partners[i].id == playerId) {
            partner = this.partners[i];
            break;
        }
    }
    return partner;
}

Player.prototype.setEquipmentsEntity = function(equipmentsEntity){
    this.equipmentsEntity = equipmentsEntity;
    //this.updateAttribute();
}

/**
 * 重置任务
 * @param type
 * @param taskId
 */
Player.prototype.resetTask = function(type, taskId) {
    var task = this.curTasksEntity[type];
    var date = new Date();
    if(taskId != null && taskId != "")
        task.taskId = taskId;
    task.status = TaskStatus.NOT_START;
    task.startTime = date.getTime();
    task.taskRecord = {"itemNum": 0};
    task.save();
}

/**
 * 更新金币
 * @param money
 */
Player.prototype.updateMoney = function(money) {
    this.money += parseInt(money);
    if(this.money < 0)
        this.money = 0;
    this.save();
};

/**
 *
 * @param message
 */
Player.prototype.pushMessage = function(message) {

}

/**
 * 更新经验
 * @param exp
 */
Player.prototype.updateExp = function(exp) {
    this.experience += parseInt(exp);
    if(this.experience < 0)
        this.experience = 0;
    this.save();
};

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Player.prototype.toJSON = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        showCIds: this.showCIds,
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
        currentIndu: this.currentIndu,
        focus: this.focus,
        sunderArmor: this.sunderArmor,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        curTasks: this.curTasksEntity.getInfo(),
        equipments: this.equipmentsEntity.getInfo(),
        package: this.packageEntity.getInfo(),
        skills: this.skills,
        buffs: this.buffs,
        formation: this.formation,
        partners: this.getPartners(),
        gift: this.gift
    };
};

Player.prototype.getBaseInfo = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        showCIds: this.showCIds,
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
        currentIndu: this.currentIndu,
        focus: this.focus,
        sunderArmor: this.sunderArmor,
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
        buffs: this.buffs,
        formation: this.formation,
        gift: this.gift
    };
};