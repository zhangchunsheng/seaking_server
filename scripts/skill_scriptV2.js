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
var fightUtil = require('../app/utils/fightUtil');
var constsV2 = require('../app/consts/constsV2');

function getBuffCategory(buffType) {
    var buffCategory = 0;
    if(buffType == constsV2.buffTypeV2.SHIELDS) {//护盾
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.EXTRAARMOR) {//额外护甲
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.BLOCK) {//格挡
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.DODGE) {//闪避
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.ASYLUM) {//庇护
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.ADDMAXHP) {//提升生命上限
        buffCategory = constsV2.buffCategory.AFTER_DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.REDUCE_SCOPE_DAMAGE) {//减范围伤害
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE) {//范围伤害
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.ADDATTACK) {//加攻击力
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.ADDSUNDERARMOR) {//加破甲
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.POISON) {
        buffCategory = constsV2.buffCategory.ROUND;
    } else if(buffType == constsV2.buffTypeV2.ADDHP) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.REDUCEATTACK_ADDSUNDERARMOR) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.EXTRATARGET) {
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE_AND_ADDHP) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.PARALLELDAMAGE) {
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.RECOVERYHP) {
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.PROMOTEHP) {
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.ADDDODGE) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.ICE) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.SILENCE) {
        buffCategory = constsV2.buffCategory.ATTACK;
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
    /**
     * 生命值低于40%之后，下一个触发的觉醒技效果翻倍（作用在该角色身上）
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
     * 战斗中的每次被攻击，都能为自己提供额外2%的护甲，该效果无限叠加
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
            value: 0.02
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
    /**
     * 一次性受到的攻击超过生命值的20%，则可以格挡下次攻击
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
    "skill107101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        if(defenseData.reduceBlood < defense.maxHp * 0.2) {
            return;
        }
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
    "skill107201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击时，随机给己方一个单位添加庇护状态，该状态可以使此单位下次受到的伤害转移给双星少主
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
    "skill108101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var teammate = null;
        teammate = fightUtil.getRandomTeammate(this, attack, attacks);
        var buffs = teammate.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            asylumTransfer: attack
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.ASYLUM, this, buffData);
        teammate.addBuff(buff);
        return 100;
    },
    "skill108201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 在战斗中，每次承受攻击，提升5%的生命上限
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
    "skill109101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.05
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDMAXHP, this, buffData);
        defense.addBuff(buff);
        defense.fight.addMaxHp = defense.maxHp * buff.buffData.value;
        return 100;
    },
    "skill109201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 吸收所有的范围伤害，并且每次伤害不能超过生命值的25%
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
    "skill110101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = defense.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.25
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.REDUCE_SCOPE_DAMAGE, this, buffData);
        defense.addBuff(buff);
        return 100;
    },
    "skill110201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击时，有25%的几率使下次攻击伤害提升25%
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
    "skill201101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 25) {
            var buffs = attack.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: 0.25
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.ADDATTACK, this, buffData);
            attack.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill201201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击有75%的几率给敌方一个单位附加毒状态，持续2回合。毒：治疗量减半
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
    "skill202101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 75) {
            var buffs = defense.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: 2
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.POISON, this, buffData);
            defense.fight.poison = true;
            defense.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill202201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击同一目标时，每次攻击提升5%的攻击吸血
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
    "skill203101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                if(buffs[i].buffData.playerId == defense.id) {
                    buffs[i].buffData.value += 0.05;
                } else {
                    buffs[i].buffData = {
                        playerId: defense.id,
                        formationId: defense.formationId,
                        value: 0.05
                    }
                }
                return 100;
            }
        }
        var buffData = {
            playerId: defense.id,
            formationId: defense.formationId,
            value: 0.05
        };
        attackData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDHP, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill203201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次主动攻击，都为自己提供4%的幸运加成，效果无限叠加
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
    "skill204101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                buffs[i].buffData.value += 0.04;
                return 100;
            }
        }
        var buffData = {
            value: 0.04
        };
        attackData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDSUNDERARMOR, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill204201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击有90%的几率是幸运翻倍，作用一次
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
    "skill205101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 90) {
            var buffs = attack.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: 2
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.ADDSUNDERARMOR, this, buffData);
            attack.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill205201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次攻击攻击力降低10%，幸运提高10%
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
    "skill206101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            reduceAttack: 0.1,
            addSunderArmor: 0.2
        };
        attackData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.REDUCEATTACK_ADDSUNDERARMOR, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill206201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击一个目标，会使下次的攻击变为全体攻击，但是攻击力会减半。（一次单攻，一次群攻）
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
    "skill207101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.5
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill207201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次主动攻击都会附带一个额外的随机目标，额外目标受到40%的伤害
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
    "skill208101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.4
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.EXTRATARGET, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill208201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击，会使下次的攻击变为全体攻击，并附加10%的吸血，但攻击力减半（一次单攻，之后群攻）
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
    "skill209101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.5,
            addHp: 0.1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE_AND_ADDHP, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill209201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 战斗中，攻击会附带20%的溅射伤害
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
    "skill210101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.2
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.PARALLELDAMAGE, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill210201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 战斗中，每次攻击提供5%的攻击力，效果无限叠加
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
    "skill211101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                buffs[i].buffData.value += 0.05;
                return 100;
            }
        }
        var buffData = {
            value: 0.05
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE, this, buffData);
        attack.addBuff(buff);
        attack.fight.addAttack += buff.buffData.value;
        return 100;
    },
    "skill211201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次攻击，用伤害的20%给己方随机目标回复生命
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
    "skill301101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.2
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.RECOVERYHP, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill301201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击有75%的几率给己方附加一个吸血buff，使其下次攻击附加10%的攻击吸血
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
    "skill302101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 75) {
            var buffs = attack.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: 0.1
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.ADDHP, this, buffData);
            attack.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill302201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次主动攻击，觉醒技触发时的生命值提升1%
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
     * @returns {number}
     */
    "skill303101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        var buffData = {
            value: 0.01
        };
        attackData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.PROMOTEHP, this, buffData);
        attack.addBuff(buff);
        return 100;
    },
    "skill303201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每次主动攻击，都给己方全体增加1%的攻击力，最多叠加十次
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
    "skill304101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffs = attack.buffs;
        var value;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                if(buffs[i].count >= 10) {
                    value = 0.01;
                    fightUtil.updatePlayermateBuff(attacks, buffs[i].buffId, value);
                } else {
                    value = buffs[i].buffData.value + 0.01;
                    fightUtil.updatePlayermateBuff(attacks, buffs[i].buffId, value);
                }

                return 100;
            }
        }
        var buffData = {
            player: attack,
            value: 0.01,
            count: 1
        };
        attackData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDATTACK, this, buffData);
        fightUtil.addPlayermateBuff(attacks, buff);
        return 100;
    },
    "skill304201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击变成给己方生命值百分比最少的单位回复生命值
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
    "skill305101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attackData.action = constsV2.attackAction.skill;
        fightUtil.recoverHp(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        return 1;
    },
    "skill305201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 被攻击时，随机给己方目标添加一个闪避提升10%的状态，持续一回合
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
    "skill306101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var buffData = {
            value: 0.1
        };
        defenseData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDDODGE, this, buffData);
        var player;
        player = fightUtil.getRandomPlayer(null, defenses);
        var buffs = player.buffs;
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == this.skillId) {
                return 100;
            }
        }
        player.addBuff(buff);
        return 100;
    },
    "skill306201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击时，有30%的几率放弃伤害转而冰冻对方，持续一次
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
    "skill307101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 30) {
            var buffs = defense.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: true
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.ICE, this, buffData);
            defense.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill307201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 主动攻击时，有30%的几率沉默目标，持续一次
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
    "skill308101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 30) {
            var buffs = defense.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: true
            };
            attackData.skillId = this.skillId;
            var buff = getSkillBuff(constsV2.buffTypeV2.SILENCE, this, buffData);
            defense.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill308201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    }
}

module.exports = skill_script;