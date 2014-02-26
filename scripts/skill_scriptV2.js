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
var buffUtil = require('../app/utils/buffUtil');
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
    } else if(buffType == constsV2.buffTypeV2.POISON) {//施毒
        buffCategory = constsV2.buffCategory.ROUND;
    } else if(buffType == constsV2.buffTypeV2.ADDHP) {//加血
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.REDUCEATTACK_ADDSUNDERARMOR) {//减伤
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.EXTRATARGET) {//额外目标
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE_AND_ADDHP) {//范围伤害并加血
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.PARALLELDAMAGE) {//溅射
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.RECOVERYHP) {
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.PROMOTEHP) {//提升血量
        buffCategory = constsV2.buffCategory.ATTACKING;
    } else if(buffType == constsV2.buffTypeV2.ADDDODGE) {//提升闪避
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.ICE) {//冰冻
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.SILENCE) {//沉默
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.FREEZE) {//冻结
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.TURN_DAMAGE) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.ADDBLOCK) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.KING_WILL) {
        buffCategory = constsV2.buffCategory.AFTER_DIE;
    } else if(buffType == constsV2.buffTypeV2.ADDDAMAGE) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.IMMUNE_FREEZE) {
        //buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.NODAMAGE_EXCEPT_ATTACK) {
        //buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.EXCHANGE_HP_ATTACK) {
        //buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE_THREETIME) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.OFFSET_SHIELDS) {
        buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.CLEAR_BAD_STATUS) {
        //buffCategory = constsV2.buffCategory.DEFENSE;
    } else if(buffType == constsV2.buffTypeV2.CLEAR_AWAY) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.STUNT) {
        buffCategory = constsV2.buffCategory.ATTACK;
    } else if(buffType == constsV2.buffTypeV2.STASIS) {
        buffCategory = constsV2.buffCategory.ATTACK;
    }
    return buffCategory;
}

function getSkillBuff(buffType, skill, buffData) {
    var effectId = "XG" + skill.skillId.replace("SK","");
    var buff = new BuffV2({
        buffId: skill.skillId.replace("SK", ""),
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
    var effectId = "XG" + skill.skillId.replace("SK","");
    var buff = new BuffV2({
        buffId: skill.skillId.replace("SK", ""),
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
        var value = 0.2;
        var enhanceBuff = {};
        if(random >= 1 && random <= 75) {
            var buffs = attack.buffs;

            /*enhanceBuff = buffUtil.getBuff("101201", buffs);//skillId  SK101201
            if(typeof enhanceBuff.buffData != "undefined") {
                value = value * enhanceBuff.buffData.value;
            }*/

            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
                    buffs[i].value = value;
                    return 100;
                }
            }
            var buffData = {
                value: value
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
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }
        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 2
        };
        playerData.skillId = this.skillId;
        var buff = getSkillBuff(constsV2.buffTypeV2.AWAKEN_ENHANCE_TRIGGERSKILL, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于30%之后，会产生一个持久性的护盾，该护盾使受到的攻击伤害减免25%
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
    "skill102201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.25
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.SHIELDS, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于20%之后，攻击该单位的目标有50%的几率被冻结一回合
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
    "skill103201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.25
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.FREEZE, this, buffData);
        player.addBuff(buff);
        return 100;
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
                    return 100;
                }
            }
            var buffData = {
                value: -1
            };
            attackData.skillId = this.skillId;
            var buff = getTeamSkillBuff(constsV2.buffTypeV2.OFFSET_SHIELDS, this, buffData);
            attackFightTeam.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    /**
     * 生命值进入低于15%的状态，立即对己方施放一个可以抵挡3次任何攻击的护盾
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
    "skill104201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var team;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            team = attackFightTeam;
            playerData = attackData;
        } else {
            team = defenseFightTeam;
            playerData = defenseData;
        }

        var buffs = team.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 3
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.OFFSET_SHIELDS, this, buffData);
        team.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值进入低于20%的状态，立即消耗所有的额外的护甲，给自己加为对应点数*10的生命值（只能触发一次）
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
    "skill105201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 10
        };
        player.fightValue.hp += player.fightValue.sunderArmor * buffData.value;
        player.hp = player.fightValue.hp;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDHP, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于10%之后，攻击他的单位受到100%的反伤
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
    "skill106201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;//必须是防守方
        if(attackSide == constsV2.characterFightType.ATTACK) {
            return 0;
        }
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                attack.fightValue.hp -= Math.round(defenseData.reduceBlood * buffs[i].buffData.value / 100);
                fightUtil.checkDied(attack, attackData);
                return 100;
            }
        }
        var buffData = {
            value: 100
        };
        attack.fightValue.hp -= Math.round(defenseData.reduceBlood * buffData.value / 100);
        attack.hp = attack.fightValue.hp;
        fightUtil.checkDied(attack, attackData);
        var buff = getSkillBuff(constsV2.buffTypeV2.TURN_DAMAGE, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于40%，格挡系数变为0.6
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
    "skill107201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.6
        };
        player.fightValue.block = buffData.value * 100;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDBLOCK, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 承受到致命伤害时，不会死亡同时也会免疫治疗效果，持续3次被攻击
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
    "skill108201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 3
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.KING_WILL, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值进入低于基础生命值的30%的状态，瞬间提升基础生命值20%的生命上限
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
    "skill109201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.2
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDMAXHP, this, buffData);
        player.addBuff(buff);

        var addMaxHp = player.maxHp * buffData.value;
        playerData.addMaxHp = addMaxHp;
        player.fightValue.maxHp += addMaxHp;
        player.fightValue.hp += addMaxHp;

        player.hp = player.fightValue.hp;

        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于30%以后，不会再受到任何技能的影响
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
    "skill110201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.IGNORE_SKILL, this, buffData);
        player.addBuff(buff);

        player.fight.ignore_skill = true;

        return 100;
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于40%之后，会触发上一个发动过觉醒技的英雄的觉醒技（没有上一个则继续等待）
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
    "skill201201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        var playerFightTeam;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
            playerFightTeam = attackFightTeam;
        } else {
            player = defense;
            playerData = defenseData;
            playerFightTeam = defenseFightTeam;
        }

        //触发上一次团队中的觉醒技

        return 100;
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于40%之后，伤害提升25%
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
    "skill202201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.25
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDDAMAGE, this, buffData);
        player.addBuff(buff);

        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于25%之后，免疫冻结效果
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
    "skill203201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.IMMUNE_FREEZE, this, buffData);
        player.addBuff(buff);

        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值进入20%的状态瞬间，消耗所有额外的幸运加成，给自己回复对应点数*5的生命值
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
    "skill204201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 5
        };
        player.fightValue.hp += player.fightValue.sunderArmor * buffData.value;
        player.hp = player.fightValue.hp;
        var buff = getSkillBuff(constsV2.buffTypeV2.ADDHP, this, buffData);
        player.addBuff(buff);
        return 100;
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于20%以后，不承受主动攻击之外的任何伤害
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
    "skill205201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.NODAMAGE_EXCEPT_ATTACK, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于30%之瞬间，随机跟敌方一个目标置换生命值和攻击力
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
    "skill206201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.EXCHANGE_HP_ATTACK, this, buffData);
        player.addBuff(buff);

        var hp = player.fightValue.hp;
        var attack = player.fightValue.attack;

        var opponet = fightUtil.getRandomPlayer(null, defenses);
        if(opponet != null) {
            player.fightValue.hp = opponet.fightValue.hp;
            player.fightValue.attack = opponet.fightValue.attack;
            player.hp = player.fightValue.hp;

            opponet.fightValue.hp = hp;
            opponet.fightValue.attack = attack;
            opponet.hp = opponet.fightValue.hp;
        }
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于40%以后，攻击减半，但是攻击全部变为群体攻击，并且每次攻击都分为3次进行
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
    "skill207201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.5
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CHANGETO_SCOPE_DAMAGE_THREETIME, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 死亡瞬间，清除己方所有不良状态
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
    "skill208201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CLEAR_BAD_STATUS, this, buffData);
        player.addBuff(buff);

        //clear bad status
        fightUtil.clearBadStatus(attack, attacks);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于40%以后，攻击力恢复，但是能攻击一个目标，如果目标生命值低于5% ，则直接斩杀
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
    "skill209201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 0.05
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CLEAR_AWAY, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 死亡时，是敌方生命值最多的单位攻击力变为0，持续两次
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
    "skill210201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        var opponent;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
            opponent = fightUtil.getPlayerWithMaxHp(defenses);
        } else {
            player = defense;
            playerData = defenseData;
            opponent = fightUtil.getPlayerWithMaxHp(attacks);
        }

        var buffs = opponent.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 2
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.STUNT, this, buffData);
        opponent.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 生命值低于20%之后，有30%的几率对攻击目标进行秒杀
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
    "skill211201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        var buffs = player.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 30
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.CLEAR_AWAY, this, buffData);
        player.addBuff(buff);
        return 100;
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
    /**
     * 战斗中杀死该单位的战斗角色，停滞一回合
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
    "skill301201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        var playerData;
        var opponent;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
            opponent = defense;
        } else {
            player = defense;
            playerData = defenseData;
            opponent = attack;
        }

        var buffs = opponent.buffs;
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
                return 0;
            }
        }
        var buffData = {
            value: 1
        };
        var buff = getSkillBuff(constsV2.buffTypeV2.STASIS, this, buffData);
        opponent.addBuff(buff);
        return 100;
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
        var buffId = this.skillId.replace("SK", "");
        for(var i = 0, l = buffs.length ; i < l ; i++) {
            if(buffs[i].buffId == buffId) {
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
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
            var buffId = this.skillId.replace("SK", "");
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == buffId) {
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