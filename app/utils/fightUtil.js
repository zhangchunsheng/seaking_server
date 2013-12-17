/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-14
 * Description: fightUtil
 */
var consts = require('../consts/constsV2');
var EntityType = require('../consts/consts').EntityType;
var formulaV2 = require('../consts/formulaV2');
var utils = require('./utils');

var fightUtil = module.exports;

fightUtil.calculateHP = function(defense, defenseData) {
    if(defense.hp <= 0) {
        defense.hp = 0;
        defense.died = defenseData.died = true;
        defense.costTime = 10000;
    }
}

fightUtil.getTriggerCondition = function() {

}

/**
 *
 * @param defense
 * @param defenseData
 */
fightUtil.reduceHp = function(attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, data, attackData, defenseData) {
    if(defense.fight.asylumTransfer != null) {
        defense.fight.asylumTransfer.fightValue.hp = Math.ceil(defense.fight.asylumTransfer.fightValue.hp - defenseData.reduceBlood);
        if(defense.fight.asylumTransfer.fightValue.hp <= 0) {
            defense.fight.asylumTransfer.fightValue.hp = 0;
            defense.fight.asylumTransfer.died = true;
            defense.fight.asylumTransfer.costTime = 10000;
        }
        defenseData.transfer = {
            playerId: defense.fight.asylumTransfer.id
        };
        if(defense.fight.asylumTransfer.died) {
            defenseData.transfer.died = true;
        }
        defense.fight.asylumTransfer = null;
    } else {
        if(defenseData.reduceBlood > 0) {
            var triggerCondition = {
                type: consts.skillTriggerConditionType.GETDAMAGE
            }
            defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, data, attackData, defenseData);
        }
        var awakenCondition = {
            type: consts.skillTriggerConditionType.AWAKEN
        };
        defense.awakenSkill(consts.characterFightType.DEFENSE, awakenCondition, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, data, attackData, defenseData);
        defense.fightValue.hp = Math.ceil(defense.fightValue.hp - defenseData.reduceBlood);
    }
}

fightUtil.updateAttackData = function(attack, attackData) {
    if(attack.fight.addAttackValue > 0) {
        attackData.addAttack = attack.fight.addAttackValue;
    }
    if(attack.fight.addSunderArmorValue > 0) {
        attackData.addSunderArmor = attack.fight.addSunderArmorValue;
    }
    if(attack.fight.poison) {
        attackData.poison = attack.fight.poison;
    }
    if(attack.fight.addHpValue > 0) {
        attackData.addHp = attack.fight.addHpValue;
    }
    if(attack.fight.reduceAttackValue > 0) {
        attackData.reduceAttack = attack.fight.reduceAttackValue;
    }
    if(attack.fight.ice) {
        attackData.ice = attack.fight.ice;
    }
    if(attack.fight.silence) {
        attackData.silence = attack.fight.silence;
    }
}

fightUtil.updateDefenseData = function(defense, defenseData) {
    if(defense.fight.reduceDamageValue > 0) {
        defenseData.reduceDamage = defense.fight.reduceDamageValue;
    }
    if(defense.fight.addDefenseValue > 0) {
        defenseData.addDefense = defense.fight.addDefenseValue;
    }
    if(defense.fight.addMaxHp > 0) {
        defenseData.addMaxHp = defense.fight.addMaxHp;
    }
    if(defense.fight.poison) {
        defenseData.poison = defense.fight.poison;
    }
    if(defense.fight.addDodgeValue > 0) {
        defenseData.addDodge = defense.fight.addDodgeValue;
    }
}

/**
 * useSkillBuffs
 * @param dataTypes
 * @param dataType
 * @param buffCategory
 * @param fightType
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
fightUtil.useSkillBuffs = function(dataTypes, dataType, buffCategory, fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var player;
    var team;
    if(fightType == consts.characterFightType.ATTACK || fightType == consts.characterFightType.AFTER_ATTACK || fightType == consts.characterFightType.ATTACKING) {
        player = attack;
        team = attackFightTeam;
    } else if(fightType == consts.characterFightType.DEFENSE || fightType == consts.characterFightType.AFTER_DEFENSE) {
        player = defense;
        team = defenseFightTeam;
    }
    var skillBuffs = player.getSkillBuffs();
    var teamBuffs = team.getSkillBuffs();
    var buffs = skillBuffs;
    for(var i = 0 , l = teamBuffs.length ; i < l ; i++) {
        buffs.push(teamBuffs[i]);
    }
    for(var i = 0, l = buffs.length ; i < l ; i++) {
        if(buffs[i].buffCategory == buffCategory) {
            dataType = buffs[i].invokeScript(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            if(dataType == -1) {
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
}

/**
 * getBuffCategory
 * @param fightType
 * @returns {*}
 */
fightUtil.getBuffCategory = function(fightType) {
    if(fightType == consts.characterFightType.ATTACK) {
        return consts.buffCategory.ATTACK;
    } else if(fightType == consts.characterFightType.DEFENSE) {
        return consts.buffCategory.DEFENSE;
    } else if(fightType == consts.characterFightType.AFTER_ATTACK) {
        return consts.buffCategory.AFTER_ATTACK;
    } else if(fightType == consts.characterFightType.AFTER_DEFENSE) {
        return consts.buffCategory.AFTER_DEFENSE;
    } else if(fightType == consts.characterFightType.ROUND) {
        return consts.buffCategory.ROUND;
    } else if(fightType == consts.characterFightType.ATTACKING) {
        return consts.buffCategory.ATTACKING;
    }
}

/**
 * checkDied
 * @param player
 * @param data
 */
fightUtil.checkDied = function(player, data) {
    if(player.fightValue.hp <= 0) {
        player.fightValue.hp = 0;
        player.died = data.died = true;
        player.costTime = 10000;
    }
}

/**
 * addAttackAnger
 * @param attack
 */
fightUtil.addAttackAnger = function(attack) {
    if(attack.type == EntityType.MONSTER) {
        attack.anger += attack.restoreAngerSpeed.ea;
    } else {
        attack.anger += attack.restoreAngerSpeed.ea;
    }
}

/**
 * addDefenseAnger
 * @param attackData
 * @param defense
 */
fightUtil.addDefenseAnger = function(attackData, defense) {
    if(attackData.action == consts.attackAction.common) {// each hit received
        if(defense.type == EntityType.MONSTER) {
            defense.anger += defense.restoreAngerSpeed.ehr;
        } else {
            defense.anger += defense.restoreAngerSpeed.ehr;
        }
    } else if(attackData.action == consts.attackAction.skill) {// each skill hit received
        if(defense.type == EntityType.MONSTER) {
            defense.anger += defense.restoreAngerSpeed.eshr;
        } else {
            defense.anger += defense.restoreAngerSpeed.eshr;
        }
    }
}

/**
 * changeTargetState
 * @param target
 * @param defenseData
 */
fightUtil.changeTargetState = function(target, defenseData) {
    if(defenseData.isCounter) {
        target.isCounter = true;
        target.counterValue = defenseData.counterValue;
    }
    if(defenseData.reduceDamage > 0) {
        target.reduceDamage = defenseData.reduceDamage;
    }
    if(defenseData.triggerSkill > 0) {
        target.triggerSkill = defenseData.triggerSkill;
    }
    if(defenseData.addDefense > 0) {
        target.addDefense = defenseData.addDefense;
    }
    if(defenseData.transfer) {
        target.transfer = defenseData.transfer;
    }
    if(defenseData.addMaxHp > 0) {
        target.addMaxHp = defenseData.addMaxHp;
    }
    if(defenseData.poison) {
        target.poison = defenseData.poison;
    }
    if(defenseData.addDodge) {
        target.addDodge = defenseData.addDodge;
    }
}

fightUtil.changeFightData = function(fightData, attackData) {
    if(attackData.addAttack) {
        fightData.addAttack = attackData.addAttack;
    }
    if(attackData.addSunderArmor) {
        fightData.addSunderArmor = attackData.addSunderArmor;
    }
    if(attackData.poison) {
        fightData.poison = attackData.poison;
    }
    if(attackData.addHp) {
        fightData.addHp = attackData.addHp;
    }
    if(attackData.reduceAttack) {
        fightData.reduceAttack = attackData.reduceAttack;
    }
    if(attackData.ice) {
        fightData.ice = attackData.ice;
    }
    if(attackData.silence) {
        fightData.silence = attackData.silence;
    }
}

/**
 * checkBlock
 * @param defense
 * @returns {boolean}
 */
fightUtil.checkBlock = function(defense) {
    if(defense.fight.isBlock) {
        defense.fight.isBlock = false;
        return true;
    }
    return false;
}

/**
 * checkDodge
 * @param defense
 * @returns {boolean}
 */
fightUtil.checkDodge = function(defense) {
    if(defense.fight.isDodge) {
        defense.fight.isDodge = false;
        return true;
    }
    return false;
}

/**
 *
 * @param player
 * @param teams
 * @returns {teammate}
 */
fightUtil.getRandomTeammate = function(skill, player, teams) {
    var teammate = null;
    if(teams.length == 1) {
        teammate = player;
    } else {
        var array = [];
        for(var i in teams) {
            if(teams[i].id == player.id)
                continue;
            if(teams[i].died)
                continue;
            if(fightUtil.checkBuff(skill, player))
                continue;
            array.push(i);
        }
        if(array.length > 0) {
            var random = utils.random(0, array.length - 1);
            teammate = teams[array[random]];
        }
        if(teammate == null) {
            teammate = player;
        }
    }
    return teammate;
}

fightUtil.getRandomOpponet = function(defense, defenses) {
    fightUtil.getRandomPlayer(defense, defenses);
}

fightUtil.getRandomPlayer = function(player, players) {
    var playermate = null;
    if(players.length == 1) {
        if(player != null) {
            playermate = null;
        } else {
            playermate = players[0];
        }
    } else {
        var array = [];
        for(var i in players) {
            if(player != null && players[i].id == player.id) {
                continue;
            }
            if(players[i].died)
                continue;
            array.push(i);
        }
        if(array.length > 0) {
            var random = utils.random(0, array.length - 1);
            playermate = players[array[random]];
        }
    }
    return playermate;
}

fightUtil.checkBuff = function(skill, player) {
    var buffs = player.getSkillBuffs();
    for(var i = 0, l = buffs.length ; i < l ; i++) {
        if(skill.skillId == buffs[i].buffId) {
            return true;
        }
    }
    return false;
}

fightUtil.calculateCBD = function(random, attack, defense, isCriticalHit, damageType, isBlock, isDodge, isCommandAttack) {
    //暴击
    var criticalHit = attack.fightValue.criticalHit * 100;
    //格挡
    var block = defense.fightValue.block * 100;
    //闪避
    var dodge = defense.fightValue.dodge * 100;
    var num1 = criticalHit + block;
    var num2 = num1 + dodge;
    random = utils.random(1, 10000);
    if(random >= 1 && random <= criticalHit) {
        isCriticalHit = true;
        damageType = consts.damageType.criticalHit;
    } else if(random > criticalHit && random <= num1) {
        isBlock = true;
    } else if(random > num1 && random <= num2) {
        isDodge = true;
    } else {
        isCommandAttack = true;
    }
    return {
        isCriticalHit: isCriticalHit,
        isBlock: isBlock,
        isDodge: isDodge
    }
}

/**
 * 用于群攻计算
 * @param attackSide
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
fightUtil.attack = function(opts, attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    if(attack.died)
        return;
    if(defense.died)
        return;
    var triggerCondition = {};
    
    defense.useSkillBuffs(consts.characterFightType.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

    // 计算战斗
    defenseData.defense = defense.fightValue.defense;

    var random = 0;

    // 判断闪避、暴击、格挡、普通攻击
    var isCriticalHit = false;
    var isBlock = false;
    var isDodge = false;
    var isCommandAttack = false;
    var damageType = consts.damageType.common;
    //暴击
    var criticalHit = attack.fightValue.criticalHit * 100;
    //格挡
    var block = defense.fightValue.block * 100;
    //闪避
    var dodge = defense.fightValue.dodge * 100;
    var num1 = criticalHit + block;
    var num2 = num1 + dodge;
    random = utils.random(1, 10000);
    if(random >= 1 && random <= criticalHit) {
        isCriticalHit = true;
        damageType = consts.damageType.criticalHit;
    } else if(random > criticalHit && random <= num1) {
        isBlock = true;
    } else if(random > num1 && random <= num2) {
        isDodge = true;
    } else {
        isCommandAttack = true;
    }

    isBlock = fightUtil.checkBlock(defense);
    isDodge = fightUtil.checkDodge(defense);

    // 判定是否闪避
    // random = utils.random(1, 10000);
    if(isDodge) {// 闪避
        triggerCondition = {
            type: consts.skillTriggerConditionType.DODGE
        }
        defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

        defenseData.action = consts.defenseAction.dodge;//1 - 被击中 2 - 闪避 3 - 被击中反击
        defenseData.reduceBlood = 0;

        // 守方
        // 增加怒气
        fightUtil.addDefenseAnger(attackData, defense);

        defenseData.hp = defense.fightValue.hp;
        defenseData.anger = defense.anger;

        var target = {
            id: defense.id,
            damageType: damageType,
            fId: defense.formationId,
            action: defenseData.action,
            hp: defenseData.hp,
            anger: defenseData.anger,
            reduceBlood: defenseData.reduceBlood,
            buffs: defense.getBuffs()
        };
        opts.damage += defenseData.reduceBlood;
        opts.damageInfo.push({
            playerId: defense.id,
            damage: defenseData.reduceBlood
        });
        fightData.target.push(target);
    } else {
        // 触发被攻击技能
        triggerCondition = {
            type: consts.skillTriggerConditionType.BEATTACKED
        }
        defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);


        defenseData.action = consts .defenseAction.beHitted;

        // 判定是否格挡
        // random = utils.random(1, 10000);
        if(isBlock) {// 格挡
            defenseData.isBlock = true;
            defenseData.action = consts.defenseAction.block;

            triggerCondition = {
                type: consts.skillTriggerConditionType.BLOCK
            }
            defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }

        if(isCriticalHit) {// 暴击
            defenseData.reduceBlood = formulaV2.calCritDamage(attack, defense);
        } else if(isBlock) {
            defenseData.reduceBlood = formulaV2.calBlockDamage(attack, defense);
        } else {
            //defenseData.reduceBlood = formula.calDamage(attack, defense);
            //伤害 = (100 + 破甲) * 攻击力 /（100 + 护甲）
            defenseData.reduceBlood = formulaV2.calDamage(attack, defense);
        }

        if(defenseData.reduceBlood < 0) {
            defenseData.reduceBlood = 0;
        }

        // 更新状态
        // 守方
        defenseData.buffs = defense.getBuffs();

        // 判定是否反击
        var counter = defense.fightValue.counter * 100;
        random = utils.random(1, 10000);
        if(random >= 1 && random <= counter) {// 反击
            triggerCondition = {
                type: consts.skillTriggerConditionType.COUNTER
            }
            defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

            var damage = formulaV2.calCounterDamage(defense, attack);
            defenseData.isCounter = true;
            defenseData.counterValue = damage;//反击伤害
            attack.fightValue.hp = Math.ceil(attack.fightValue.hp - damage);
            attack.hp = attack.fightValue.hp;
            fightUtil.checkDied(attack, attackData);
        }

        // 更新数据
        defenseData.fId = defense.formationId;

        fightUtil.reduceHp(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        fightUtil.updateDefenseData(defense, defenseData);
        fightUtil.checkDied(defense, defenseData);

        defense.useSkillBuffs(consts.characterFightType.AFTER_DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

        // 守方
        // 增加怒气
        fightUtil.addDefenseAnger(attackData, defense);

        // 更新状态
        defenseData.hp = defense.fightValue.hp;
        defenseData.anger = defense.anger;

        var target = {
            id: defense.id,
            damageType: damageType,
            fId: defense.formationId,
            action: defenseData.action,
            hp: defenseData.hp,
            anger: defenseData.anger,
            reduceBlood: defenseData.reduceBlood,
            buffs: defenseData.buffs
        };
        opts.damage += defenseData.reduceBlood;
        opts.damageInfo.push({
            playerId: defense.id,
            damage: defenseData.reduceBlood
        });
        fightUtil.changeTargetState(target, defenseData);
        fightData.target.push(target);
    }
}

/**
 *
 * @param skill
 * @param players
 * @returns {null}
 */
fightUtil.hasSkill = function(skill, players) {
    var player = null;
    for(var i in players) {
        for(var j = 0 ; j < players[i].buffs.length ; j++) {
            if(players[i].buffs[j].buffId == skill.skillId) {
                player = players[i];
                break;
            }
        }
    }
    return player;
}

/**
 *
 * @param attackSide
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
fightUtil.calculateDamage = function(opts, attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    if(attack.died)
        return;
    if(defense.died)
        return;
    var triggerCondition = {};

    defense.useSkillBuffs(consts.characterFightType.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

    // 计算战斗
    defenseData.defense = defense.fightValue.defense;

    var random = 0;

    // 判断闪避、暴击、格挡、普通攻击
    var isCriticalHit = false;
    var isBlock = false;
    var isDodge = false;
    var isCommandAttack = false;
    var damageType = consts.damageType.common;
    //暴击
    var criticalHit = attack.fightValue.criticalHit * 100;
    //格挡
    var block = defense.fightValue.block * 100;
    //闪避
    var dodge = defense.fightValue.dodge * 100;
    var num1 = criticalHit + block;
    var num2 = num1 + dodge;
    random = utils.random(1, 10000);
    if(random >= 1 && random <= criticalHit) {
        isCriticalHit = true;
        damageType = consts.damageType.criticalHit;
    } else if(random > criticalHit && random <= num1) {
        isBlock = true;
    } else if(random > num1 && random <= num2) {
        isDodge = true;
    } else {
        isCommandAttack = true;
    }

    isBlock = fightUtil.checkBlock(defense);
    isDodge = fightUtil.checkDodge(defense);

    // 判定是否闪避
    // random = utils.random(1, 10000);
    if(isDodge) {// 闪避
        triggerCondition = {
            type: consts.skillTriggerConditionType.DODGE
        }
        defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

        defenseData.action = consts.defenseAction.dodge;//1 - 被击中 2 - 闪避 3 - 被击中反击
        defenseData.reduceBlood = 0;

        // 守方
        // 增加怒气
        fightUtil.addDefenseAnger(attackData, defense);

        defenseData.hp = defense.fightValue.hp;
        defenseData.anger = defense.anger;

        var target = {
            id: defense.id,
            damageType: damageType,
            fId: defense.formationId,
            action: defenseData.action,
            hp: defenseData.hp,
            anger: defenseData.anger,
            reduceBlood: defenseData.reduceBlood,
            buffs: defense.getBuffs()
        };
        opts.damage += defenseData.reduceBlood;
        opts.damageInfo.push({
            playerId: defense.id,
            damage: defenseData.reduceBlood
        });
        fightData.target.push(target);
    } else {
        // 触发被攻击技能
        triggerCondition = {
            type: consts.skillTriggerConditionType.BEATTACKED
        }
        defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);


        defenseData.action = consts .defenseAction.beHitted;

        // 判定是否格挡
        // random = utils.random(1, 10000);
        if(isBlock) {// 格挡
            defenseData.isBlock = true;
            defenseData.action = consts.defenseAction.block;

            triggerCondition = {
                type: consts.skillTriggerConditionType.BLOCK
            }
            defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }

        if(isCriticalHit) {// 暴击
            defenseData.reduceBlood = formulaV2.calCritDamage(attack, defense);
        } else if(isBlock) {
            defenseData.reduceBlood = formulaV2.calBlockDamage(attack, defense);
        } else {
            //defenseData.reduceBlood = formula.calDamage(attack, defense);
            //伤害 = (100 + 破甲) * 攻击力 /（100 + 护甲）
            defenseData.reduceBlood = formulaV2.calDamage(attack, defense);
        }

        if(defenseData.reduceBlood < 0) {
            defenseData.reduceBlood = 0;
        }

        // 更新状态
        // 守方
        defenseData.buffs = defense.getBuffs();

        // 判定是否反击
        var counter = defense.fightValue.counter * 100;
        random = utils.random(1, 10000);
        if(random >= 1 && random <= counter) {// 反击
            triggerCondition = {
                type: consts.skillTriggerConditionType.COUNTER
            }
            defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

            var damage = formulaV2.calCounterDamage(defense, attack);
            defenseData.isCounter = true;
            defenseData.counterValue = damage;//反击伤害
            attack.fightValue.hp = Math.ceil(attack.fightValue.hp - damage);
            attack.hp = attack.fightValue.hp;
            fightUtil.checkDied(attack, attackData);
        }

        // 更新数据
        defenseData.fId = defense.formationId;

        fightUtil.updateDefenseData(defense, defenseData);

        defense.useSkillBuffs(consts.characterFightType.AFTER_DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

        // 守方
        // 增加怒气
        fightUtil.addDefenseAnger(attackData, defense);

        // 更新状态
        defenseData.hp = defense.fightValue.hp;
        defenseData.anger = defense.anger;

        var target = {
            id: defense.id,
            damageType: damageType,
            fId: defense.formationId,
            action: defenseData.action,
            hp: defenseData.hp,
            anger: defenseData.anger,
            reduceBlood: defenseData.reduceBlood,
            buffs: defenseData.buffs
        };
        opts.damage += defenseData.reduceBlood;
        opts.damageInfo.push({
            playerId: defense.id,
            damage: defenseData.reduceBlood
        });
        target.reduceBlood = 0;
        fightUtil.changeTargetState(target, defenseData);
        fightData.target.push(target);
    }
}

/**
 * checkReduceScopeDamage
 * @param defenses
 */
fightUtil.checkReduceScopeDamage = function(defenses) {
    var buffType = consts.buffTypeV2.REDUCE_SCOPE_DAMAGE;
    var defense = null;
    for(var i in defenses) {
        if(defenses[i].died)
            continue;
        for(var j = 0 ; j < defenses[i].buffs.length ; j++) {
            if(defenses[i].buffs[j].buffType == buffType) {
                defense = defenses[i];
                break;
            }
        }
    }
    return defense;
}

/**
 * calculateScopeDamage
 * @param opts
 * @param defense
 * @param fightData
 */
fightUtil.calculateScopeDamage = function(opts, buff, defense, defenseData, fightData) {
    var damage = opts.damage;
    if(damage > defense.fightValue.hp * buff.value) {
        damage = defense.fightValue.hp * buff.value;
    }
    var target = fightData.target;
    for(var i = 0 ; i < target.length ; i++) {
        if(target[i].id == defense.id) {
            defense.fightValue.hp = defense.fightValue.hp - damage;
            if(defense.fightValue.hp < 0) {
                defense.fightValue.hp = 0;
            }
            target[i].assimilate = [];
            for(var j = 0 ; j < opts.damageInfo.length ; j++) {
                target[i].assimilate.push({
                    playerId: opts.damageInfo[j].playerId,
                    damage: opts.damageInfo[j].damage
                });
            }
            target[i].hp = defense.fightValue.hp;
            target[i].reduceBlood = damage;
            fightUtil.checkDied(defense, defenseData);
            break;
        }
    }
}

/**
 * getTeammateWithLessHp
 * @param teams
 * @returns {null}
 */
fightUtil.getTeammateWithLessHp = function(player, teams) {
    var teammate = null;
    var hpProportion = 1;
    var temp = 0
    for(var i in teams) {
        if(teams[i].died)
            continue;
        temp = teams[i].fightValue.hp / teams[i].fightValue.maxHp;
        if(hpProportion > temp) {
            hpProportion = temp;
            teammate = teams[i];
        }
    }
    if(teammate == null) {
        teammate = player;
    }
    return teammate;
}

/**
 * recoverHp
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
fightUtil.recoverHp = function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    attack.useSkillBuffs(consts.characterFightType.ATTACK, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

    fightData.targetType = consts.effectTargetType.OWNER;
    var teammate = fightUtil.getTeammateWithLessHp(attack, attacks);
    var attack = fightUtil.getAttack(attack);
    var addHp = attack;
    if(teammate.fight.poison) {
        addHp = addHp / 2;
    }
    teammate.fightValue.hp += addHp;
    if(teammate.fightValue.hp > teammate.fightValue.maxHp) {
        teammate.fightValue.hp = teammate.fightValue.maxHp;
    }
    teammate.hp = teammate.fightValue.hp;
    var target = {
        id: teammate.id,
        fId: teammate.formationId,
        hp: teammate.fightValue.hp,
        action: consts.defenseAction.addHp,
        addHp: addHp,
        buffs: teammate.buffs
    };
    if(teammate.fight.poison) {
        target.poison = true;
    }
    fightData.target.push(target);
}

fightUtil.getAttack = function(attack) {
    var attackValue = attack.fightValue.attack;
    if(attack.fight.addAttack > 0) {
        attack.fight.addAttackValue = attack.attack * attack.fight.addAttack;
        attackValue += attack.fight.addAttackValue;
    }
    return attackValue;
}

/**
 * updateRoundBuff, There are so many buffs,fuck.
 * @param fightType
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
fightUtil.updateRoundBuff = function(fightType, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var players;
    var buffs = [];
    var player;
    if(fightType == consts.characterFightType.ATTACK) {
        players = attacks;
    } else {
        players = defenses;
    }
    for(var i in players) {
        player = players[i];
        var skillBuffs = players[i].getSkillBuffs();
        buffs = skillBuffs;
        for(var j = 0, l = buffs.length ; j < l ; j++) {
            if(buffs[j].buffCategory == consts.buffCategory.ROUND) {
                buffs[j].invokeUpdateScript(fightType, attack_formation, defense_formation, player, player, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
        }
    }
}

fightUtil.calculateHp = function(player, damage) {
    player.fightValue.hp = Math.ceil(player.fightValue.hp - damage);
    if(player.fightValue.hp < 0)
        player.fightValue.hp = 0;
    player.hp = player.fightValue.hp;
}

/**
 *
 * @param player
 * @param addHp
 */
fightUtil.addHp = function(player, addHp) {
    player.fightValue.hp = Math.ceil(player.fightValue.hp + addHp);
    if(player.fightValue.hp > player.fightValue.maxHp)
        player.fightValue.hp = player.fightValue.maxHp;
    player.hp = player.fightValue.hp;
}

fightUtil.getOtherPlayers = function(player, players) {
    var results = [];
    for(var i in players) {
        if(players[i].died)
            continue;
        if(player.id == players[i].id)
            continue;
        results.push(players[i]);
    }
    return results;
}

fightUtil.addPlayermateBuff = function(attacks, buff) {
    for(var i in attacks) {
        if(attacks[i].died) {
            continue;
        }
        attacks[i].addBuff(buff);
    }
}

fightUtil.updatePlayermateBuff = function(attacks, buffId, value) {
    var buffs;
    for(var i in attacks) {
        if(attacks[i].died) {
            continue;
        }
        buffs = attacks[i].buffs;
        for(var j = 0 ; j < buffs.length ; j++) {
            if(buffs[j].buffId == buffId) {
                buffs[j].buffData.value = value;
                break;
            }
        }
    }
}

fightUtil.updateDodge = function(defense, dodge) {
    if(defense.fight.addDodge > 0) {
        defense.fight.addDodgeValue = defense.fight.addDodge * 100;
        dodge = dodge + defense.fight.addDodgeValue;
    }
    return dodge;
}