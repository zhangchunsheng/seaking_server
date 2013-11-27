/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-21
 * Description: skill_scriptV2
 */
var Buff = require('../app/domain/buff');
var BuffV2 = require('../app/domain/buffV2');
var utils = require('../app/utils/utils');
var constsV2 = require('../app/consts/constsV2');

function getBuffCategory(buffType) {
    var buffCategory = 0;
    if(buffType == constsV2.buffTypeV2.SHIELDS) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.EXTRAARMOR) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.BLOCK) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    }
    return buffCategory;
}

function getSkillBuff(buffType, skill, buffData) {
    var effectId = "XG" + skill.skillId;
    var buff = new BuffV2({
        buffId: skill.skillId,
        useEffectId: effectId,
        type: buffType,
        skillId: skill.skillId,
        skillType: skill.type,
        skillLevel: skill.level,
        skillData: skill.skillData,
        buffData: buffData,
        buffType: buffType,
        buffCategory: getBuffCategory(buffType)
    });
    return buff;
}

function getTeamSkillBuff(buffType, skill, buffData) {
    var effectId = "XG" + skill.skillId;
    var buff = new BuffV2({
        buffId: skill.skillId,
        useEffectId: effectId,
        type: buffType,
        skillId: skill.skillId,
        skillType: skill.type,
        skillLevel: skill.level,
        skillData: skill.skillData,
        buffData: buffData,
        buffType: buffType,
        buffScope: constsV2.buffScope.TEAM,
        buffCategory: getBuffCategory(buffType)
    });
    return buff;
}

var skill_script = {
    /**
     * 有75%的几率生成一个护盾，该护盾将使下次受到的攻击伤害减免20%
     * @param attack_formation
     * @param defense_formation
     * @param attack
     * @param defense
     * @param attacks
     * @param defenses
     * @param fightData
     */
    "skill101101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 75) {
            var buffs = attack.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: 0.2
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.SHIELDS, this, buffData);
            attack.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill101201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 被攻击时，如果身上没有护盾，则产生一个护盾，该护盾使下次受到的攻击伤害减免30%
     * @param attackSide
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
     */
    "skill102101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.3
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.SHIELDS, this, buffData);
        defense.addBuff(buff);
        return 100;
    },
    "skill102201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次被攻击，则使下次受到的攻击伤害减免10%，无限叠加，直到下次发起攻击
     * @param attackSide
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
     */
    "skill103101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                buffs[i].buffData.value += 0.1;
                return 100;
            }
        }
        var buffData = {
            value: 0.1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.SHIELDS, this, buffData);
        defense.addBuff(buff);
        return 100;
    },
    "skill103201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 攻击有50%的几率释放一个护盾，该护盾可以抵消一次己方任何单位受到的指向性攻击
     * @param attackSide
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
     */
    "skill104101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 50) {
            var buffs = attack.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: -1
            };
            attackData.skillId = this.skillId;
            var buff = getTeamSkillBuff(constsV2.buffTypeV2.SHIELDS, this, buffData);
            attackFightTeam.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill104201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 战斗中的每次格挡，都能为自己提供额外20%的护甲，该效果无限叠加
     * @param attackSide
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
     */
    "skill105101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                buffs[i].buffData.value += 0.2;
                return 100;
            }
        }
        var buffData = {
            value: 0.2
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.EXTRAARMOR, this, buffData);
        defense.addBuff(buff);
        return 100;
    },
    "skill105201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 反击或者闪避之后，下次被攻击必然会格挡
     * @param attackSide
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
     */
    "skill106101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            isBlock: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.BLOCK, this, buffData);
        defense.addBuff(buff);
        return 100;
    },
    "skill106201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill107101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill107201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill108101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill108201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill109101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill109201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill110101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill110201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill201101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill201201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill202101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill202201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill203101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill203201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill204101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill204201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill205101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill205201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill206101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill206201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill207101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill207201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill208101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill208201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill209101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill209201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill210101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill210201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill211101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill211201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill301101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill301201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill302101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill302201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill303101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill303201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill304101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill304201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill305101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill305201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill306101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill306201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill307101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill307201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill308101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill308201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    }
}

module.exports = skill_script;