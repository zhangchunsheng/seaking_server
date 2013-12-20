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
var skillUtil = require('../../utils/skillUtil');
var buffUtil = require('../../utils/buffUtil');
var fightUtil = require('../../utils/fightUtil');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/constsV2');
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
    this.hp = parseInt(opts.hp);
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
    this.ghostRecoverySpeed = consts.addGhostNumOneMinute || 10;

    this.formationId = opts.formationId;

    this.attackParam = 1;
    this.defenseParam = 1;
    this.equipmentParam = 1;
    this.characterData = dataApi.character.findById(this.cId);
    this.skills = opts.skills;

    this.activeSkill = {};
    this.activeSkills = [];
    this.passiveSkills = [];

    this.currentSkills = opts.currentSkills;
    this.allSkills = opts.allSkills;

    this.restoreAngerSpeed = opts.restoreAngerSpeed || {ea:10, ehr: 3, eshr: 6};//能量恢复速度

    this.hasBuff = false;
    this.buffs = opts.buffs || buffUtil.getInitBuff();
    this.skillBuffs = [];//技能buff

    this.ghost = opts.ghost;
    this.ghostNum = parseInt(opts.ghostNum);
    this.aptitude = opts.aptitude;

    this.fightType = 0;
    this.attackType = opts.attackType || consts.attackType.SINGLE;
    //上一次使用技能
    this.lastSkillUsedInfo = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null
    };

    this.fight = {
        fightStatus: consts.characterFightStatus.COMMON,
        reduceDamage: 0,//减免伤害
        reduceDamageValue: 0,
        reduceDamageOverlay: 0,//无限叠加
        reduceDamageCounteract: 0,
        addDefense: 0,//增加护甲
        addDefenseValue: 0,
        isBlock: false,
        isDodge: false,
        asylumTransfer: null,//庇护
        addMaxHp: 0,
        addAttack: 0,
        addAttackValue: 0,
        addSunderArmor: 0,
        addSunderArmorValue: 0,
        addHp: 0,//攻击吸血
        addHpValue: 0,
        reduceAttack: 0,
        reduceAttackValue: 0,
        recoveryHp: 0,
        recoveryHpValue: 0,
        promoteHp: 0,
        promoteHpValue: 0,
        addDodge: 0,
        addDodgeValue: 0,
        ice: false,
        silence: false
    };

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
 * 技能buff
 * @param buff
 */
Character.prototype.addSkillBuff = function(buff) {
    this.buffs.push(buff);
};

/**
 * 道具buff
 * @param buff
 */
Character.prototype.addToolBuff = function(buff) {
    this.buffs.push(buff);
};

Character.prototype.getBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        buffs.push(this.buffs[i].baseInfo());
    }
    return buffs;
}

Character.prototype.getSkillBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffKind == consts.buffKind.SKILL)
            buffs.push(this.buffs[i]);
    }
    return buffs;
}

Character.prototype.getToolBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffKind == consts.buffKind.ITEM)
            buffs.push(this.buffs[i]);
    }
    return buffs;
}

Character.prototype.getTeamBuffs = function() {
    var buffs = [];
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffScope == consts.buffScope.TEAM)
            buffs.push(this.buffs[i]);
    }
    return buffs;
}

/**
 * Remove buff from buffs.
 *
 * @param {Buff} buff
 * @api public
 */
Character.prototype.removeBuff = function(buff) {
    for(var i = 0, l = this.buffs.length ; i < l ; i++) {
        if(this.buffs[i].buffId == buff.buffId) {
            this.buffs.splice(i, 1);
        }
    }
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

/**
 * 触发技能
 * 触发条件:
 * 1 - 主动攻击
 * 2 - 被攻击
 * 3 - 生命值
 * 4 - 格挡
 * 5 - 闪避
 * 6 - 暴击
 * 7 - 反击
 * 8 - 进入战斗
 * 9 - 死亡
 */
Character.prototype.triggerSkill = function(fightType, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var angers = [];
    var anger = 0;
    if(fightType == consts.characterFightType.ATTACK) {//攻击者
        var skills = attack.skills;
        for(var i in skills) {
            if(i == consts.skillV2Type.TRIGGER_SKILL) {
                anger = this.useTriggerSkill(fightType, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                angers.push(anger);
            }
        }
        for(var i = 0 ; i < angers.length ; i++) {
            if(angers[i] == 100) {
                anger = 100;
                break;
            }
        }
        if(anger >= 100) {
            attackData.action = consts.attackAction.skill;
        } else {
            if(attackData.action != consts.attackAction.skill)
                attackData.action = consts.attackAction.common;
        }
    } else if(fightType == consts.characterFightType.DEFENSE) {//防守者
        var skills = defense.skills;
        for(var i in skills) {
            if(i == consts.skillV2Type.TRIGGER_SKILL) {
                anger = this.useTriggerSkill(fightType, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                angers.push(anger);
            }
        }
        for(var i = 0 ; i < angers.length ; i++) {
            if(angers[i] == 100) {
                anger = 100;
                break;
            }
        }
        if(anger >= 100) {
            defenseData.triggerSkill = 1;
        } else {
            if(defenseData.triggerSkill != 1)
                defenseData.triggerSkill = 0;
        }
    }
    return anger;
}

/**
 * 觉醒技能
 * @param fightType
 * @param condition
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param attackFightTeam
 * @param defenseFightTeam
 * @param fightData
 * @param attackData
 * @param defenseData
 * @returns {number}
 */
Character.prototype.awakenSkill = function(fightType, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var angers = [];
    var anger = 0;
    if(fightType == consts.characterFightType.ATTACK) {//攻击者
        var skills = attack.skills;
        for(var i in skills) {
            if(i == consts.skillV2Type.AWAKEN_SKILL) {
                anger = this.useAwakenSkill(fightType, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                angers.push(anger);
            }
        }
        for(var i = 0 ; i < angers.length ; i++) {
            if(angers[i] == 100) {
                anger = 100;
                break;
            }
        }
        if(anger >= 100) {
            attackData.action = consts.attackAction.skill;
        } else {
            if(attackData.action != consts.attackAction.skill)
                attackData.action = consts.attackAction.common;
        }
    } else if(fightType == consts.characterFightType.DEFENSE) {//防守者
        var skills = defense.skills;
        for(var i in skills) {
            if(i == consts.skillV2Type.AWAKEN_SKILL) {
                anger = this.useAwakenSkill(fightType, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                angers.push(anger);
            }
        }
        for(var i = 0 ; i < angers.length ; i++) {
            if(angers[i] == 100) {
                anger = 100;
                break;
            }
        }
        if(anger >= 100) {
            defenseData.triggerSkill = 1;
        } else {
            if(defenseData.triggerSkill != 1)
                defenseData.triggerSkill = 0;
        }
    }
    return anger;
}

/**
 * 使用触发技能
 */
Character.prototype.useTriggerSkill = function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {//type=1为触发技能
    var anger = 0;
    if(utils.empty(this.skills[consts.skillV2Type.TRIGGER_SKILL])) {
        return anger;
    }
    var skill = this.skills[consts.skillV2Type.TRIGGER_SKILL];
    if(skillUtil.checkTriggerCondition(skill, condition)) {
        anger = skill.invokeScript(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    }
    return anger;
}

/**
 * 使用觉醒技能
 */
Character.prototype.useAwakenSkill = function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {//type=2为觉醒技能
    var anger = 0;
    if(utils.empty(this.skills[consts.skillV2Type.AWAKEN_SKILL])) {
        return;
    }
    var skill = this.skills[consts.skillV2Type.TRIGGER_SKILL];
    if(skillUtil.checkAwakenCondition(skill, attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData)) {
        anger = skill.invokeScript(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    }
    return anger;
}

Character.prototype.useSkillBuffs = function(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var dataTypes = [];
    var dataType = 0;
    if(fightType == consts.characterFightType.ATTACK) {
        var skillBuffs = attack.getSkillBuffs();
        var buffs = skillBuffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffCategory == consts.buffCategory.ATTACK) {
                dataType = buffs[i].invokeScript(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                dataTypes.push(dataType);
            }
        }
        for(var i = 0 ; i < dataTypes.length ; i++) {
            if(dataTypes[i] > 0) {
                dataType = dataTypes[i];
                break;
            }
        }
    } else if(fightType == consts.characterFightType.DEFENSE) {
        var skillBuffs = defense.getSkillBuffs();
        var teamBuffs = defenseFightTeam.getSkillBuffs();
        var buffs = skillBuffs;
        for(var i = 0 , l = teamBuffs.length ; i < l ; i++) {
            buffs.push(teamBuffs[i]);
        }
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffCategory == consts.buffCategory.DEFENSE) {
                dataType = buffs[i].invokeScript(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                if(dataType == -1) {//不减血
                    dataType = 0;
                    dataTypes.push(dataType);
                    break;
                }
                dataTypes.push(dataType);
            }
        }
        for(var i = 0 ; i < dataTypes.length ; i++) {
            if(dataTypes[i] > 0) {
                dataType = dataTypes[i];
                break;
            }
        }
    } else if(fightType == consts.characterFightType.AFTER_DEFENSE) {
        var buffCategory = fightUtil.getBuffCategory(fightType);
        fightUtil.useSkillBuffs(dataTypes, dataType, buffCategory, fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    } else if(fightType == consts.characterFightType.ATTACKING) {
        var buffCategory = fightUtil.getBuffCategory(fightType);
        fightUtil.useSkillBuffs(dataTypes, dataType, buffCategory, fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    }
    return dataType;
}

Character.prototype.useTeamSkillBuffs = function(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var dataTypes = [];
    var dataType = 0;
    if(fightType == consts.characterFightType.ATTACK) {
        var skillBuffs = attackFightTeam.getSkillBuffs();
        for(var i = 0, l = skillBuffs.length ; i < l ; i++) {

        }
    } else if(fightType == consts.characterFightType.DEFENSE) {
        var skillBuffs = defenseFightTeam.getSkillBuffs();
        for(var i = 0, l = skillBuffs.length ; i < l ; i++) {
            if(skillBuffs[i].buffCategory == consts.buffCategory.DEFENSE) {
                dataType = skillBuffs[i].invokeScript(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
                dataTypes.push(dataType);
            }
        }
    }
    return dataType;
}

Character.prototype.useTriggerBuff = function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

}

Character.prototype.useAwakenBuff = function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

}

Character.prototype.updateBuff = function(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var dataType = 0;
    var buffs = [];
    if(fightType == consts.characterFightType.ATTACK) {
        var skillBuffs = attack.getSkillBuffs();
        buffs = skillBuffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffCategory == consts.buffCategory.ATTACK) {
                buffs[i].invokeUpdateScript(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
        }
        fightUtil.updateRoundBuff(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    } else if(fightType == consts.characterFightType.DEFENSE) {
        var skillBuffs = defense.getSkillBuffs();
        buffs = skillBuffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffCategory == consts.buffCategory.DEFENSE) {
                buffs[i].invokeUpdateScript(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
        }
        fightUtil.updateRoundBuff(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    }
    return dataType;
}