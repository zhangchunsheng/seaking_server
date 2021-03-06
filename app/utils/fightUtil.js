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
var buffUtil = require('./buffUtil');
var BuffV2 = require('../domain/buffV2');
var dataApi = require('./dataApi');
var ghosts = require('../../config/data/ghosts');

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

        defense.fightValue.hp = Math.ceil(defense.fightValue.hp - defenseData.reduceBlood);
        //触发觉醒技能
        var awakenCondition = {
            type: consts.skillTriggerConditionType.AWAKEN
        };
        defense.awakenSkill(consts.characterFightType.DEFENSE, awakenCondition, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, data, attackData, defenseData);
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
    if(attack.fight.addDamage > 0) {
        attackData.addDamage = attack.fight.addDamage;
    }
    if(attack.fight.stasis) {
        attackData.stasis = attack.fight.stasis;
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
    if(defense.fight.ignore_skill) {
        defenseData.ignore_skill = true;
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
    if(fightType == consts.characterFightType.ATTACK) {
        player = attack;
        team = attackFightTeam;
    } else if(fightType == consts.characterFightType.DEFENSE) {
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
            dataType = buffs[i].invokeScript(fightType, buffCategory, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
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
 * checkDied
 * @param player
 * @param data
 */
fightUtil.checkDied = function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var player;
    var fightTeam;
    var data;
    if(attackSide == consts.characterFightType.ATTACK) {
        player = attack;
        fightTeam = attackFightTeam;
        data = attackData;
    } else {
        player = defense;
        fightTeam = defenseFightTeam;
        data = defenseData;
    }
    if(player.fightValue.hp <= 0) {
        player.fightValue.hp = 0;
        player.died = data.died = true;
        player.fight.costTime = player.costTime;
        player.costTime = 10000;

        fightTeam.addDiedPlayer(player);

        player.useSkillBuffs(attackSide, consts.buffCategory.AFTER_DIE, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
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
    if(defenseData.awakeSkill) {
        target.awakeSkill = defenseData.awakeSkill;
    }
    if(defenseData.ignore_skill) {
        target.ignoreSkill = defenseData.ignore_skill;
    }
    if(defenseData.fightData != null) {
        target.fightData = defenseData.fightData;
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
    if(attackData.addDamage) {
        fightData.addDamage = attackData.addDamage;
    }
    if(attackData.stasis) {
        fightData.stasis = attackData.stasis;
    }
    if(attackData.fightData != null) {
        fightData.fightData = attackData.fightData;
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
    
    defense.useSkillBuffsWithNoTeam(consts.characterFightType.DEFENSE, consts.buffCategory.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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
            fightUtil.counter(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }

        // 更新数据
        defenseData.fId = defense.formationId;

        fightUtil.reduceHp(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        fightUtil.updateDefenseData(defense, defenseData);
        fightUtil.checkDied(consts.characterFightType.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

        defense.useSkillBuffsWithNoTeam(consts.characterFightType.DEFENSE, consts.buffCategory.AFTER_DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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
 * hasSkill
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
 * 群体攻击
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
fightUtil.scopeDamage = function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    //检查是否有抵消攻击护盾
    var flag = fightUtil.checkOffsetScopeDamage(defenseFightTeam);//抵消群体伤害
    if(flag) {
        for(var i in defenses) {
            if(defenses[i].died)
                continue;
            var target = {
                action: consts.defenseAction.offsetDamage,
                id: defenses[i].id,
                fId: defenses[i].formationId,
                hp: defenses[i].hp,
                reduceBlood: 0,
                buffs: defenses[i].getBuffs()
            };
            fightData.target.push(target);
        }
        //更新防守buff
        fightUtil.removeOffsetShield(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        return;
    }
    var player = fightUtil.checkReduceScopeDamage(defenses);//减群体伤害
    var opts;
    if(player != null) {
        opts = {
            type: consts.buffTypeV2.REDUCE_SCOPE_DAMAGE,
            player: player,
            damage: 0,
            damageInfo: []
        };
        for(var i in defenses) {
            fightUtil.calculateDamage(opts, attackSide, attack_formation, defense_formation, attack, defenses[i], attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }
        fightUtil.calculateScopeDamage(opts, this, attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
    } else {
        opts = {
            damage: 0,
            damageInfo: []
        };
        for(var i in defenses) {
            fightUtil.attack(opts, attackSide, attack_formation, defense_formation, attack, defenses[i], attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }
    }
}

/**
 * 抵消群体伤害
 * @param defenseFightTeam
 */
fightUtil.checkOffsetScopeDamage = function(defenseFightTeam) {
    var buffType = consts.buffTypeV2.OFFSET_SHIELDS;
    for(var i = 0 ; i < defenseFightTeam.buffs.length ; i++) {
        if(defenseFightTeam.buffs[i].buffType == buffType) {
            return true;
        }
    }
    return false;
}

/**
 * removeOffsetShield
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
 * @returns {number}
 */
fightUtil.removeOffsetShield = function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var buffType = consts.buffTypeV2.OFFSET_SHIELDS;
    var dataType = 0;
    for(var i = 0 ; i < defenseFightTeam.buffs.length ; i++) {
        if(defenseFightTeam.buffs[i].buffType == buffType) {
            dataType = defenseFightTeam.buffs[i].invokeScript(attackSide, consts.buffCategory.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            break;
        }
    }
    return dataType;
}

/**
 * calculateDamage 用于群体攻击
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

    defense.useSkillBuffsWithNoTeam(consts.characterFightType.DEFENSE, consts.buffCategory.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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
            fightUtil.counter(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }

        // 更新数据
        defenseData.fId = defense.formationId;

        fightUtil.updateDefenseData(defense, defenseData);

        defense.useSkillBuffsWithNoTeam(consts.characterFightType.DEFENSE, consts.buffCategory.AFTER_DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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
 * calculateScopeDamage 承受所有伤害
 * @param opts
 * @param defense
 * @param fightData
 */
fightUtil.calculateScopeDamage = function(opts, buff, attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
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

            //触发觉醒技能
            var awakenCondition = {
                type: consts.skillTriggerConditionType.AWAKEN
            };
            defense.awakenSkill(consts.characterFightType.DEFENSE, awakenCondition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

            fightUtil.checkDied(consts.characterFightType.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
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
    attack.useSkillBuffs(consts.characterFightType.ATTACK, consts.buffCategory.ATTACK, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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

/**
 * getAttack
 * @param attack
 * @returns {*}
 */
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

/**
 * calculateHp
 * @param player
 * @param damage
 */
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

/**
 * getOtherPlayers
 * @param player
 * @param players
 * @returns {Array}
 */
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

/**
 * addPlayermateBuff
 * @param attacks
 * @param buff
 */
fightUtil.addPlayermateBuff = function(attacks, buff) {
    for(var i in attacks) {
        if(attacks[i].died) {
            continue;
        }
        attacks[i].addBuff(buff);
    }
}

/**
 * updatePlayermateBuff
 * @param attacks
 * @param buffId
 * @param value
 */
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

/**
 * updateDodge
 * @param defense
 * @param dodge
 * @returns {*}
 */
fightUtil.updateDodge = function(defense, dodge) {
    if(defense.fight.addDodge > 0) {
        defense.fight.addDodgeValue = defense.fight.addDodge * 100;
        dodge = dodge + defense.fight.addDodgeValue;
    }
    return dodge;
}

/**
 * getAptitudeData
 * @param cId
 * @returns {Obj|SkinCollection}
 */
fightUtil.getAptitudeData = function(cId) {
    var heroId = utils.getCategoryHeroId(cId);
    var aptitudeData = dataApi.aptitudes.findById(heroId);
    return aptitudeData;
}

/**
 * getGhostData
 * @param cId
 * @returns {*}
 */
fightUtil.getGhostData = function(cId) {
    var heroId = utils.getCategoryHeroId(cId);
    var ghostData = ghosts[heroId];
    return ghostData;
}

/**
 * counter
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defences
 * @param attackFightTeam
 * @param defenseFightTeam
 * @param fightData
 * @param attackData
 * @param defenseData
 */
fightUtil.counter = function(attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    var triggerCondition = {
        type: consts.skillTriggerConditionType.COUNTER
    }
    defense.triggerSkill(consts.characterFightType.DEFENSE, triggerCondition, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

    var buffs = defense.buffs;
    if(buffUtil.hasKindBuff(consts.buffTypeV2.NODAMAGE_EXCEPT_ATTACK, buffs)) {
        return;
    }
    var damage = formulaV2.calCounterDamage(defense, attack);
    defenseData.isCounter = true;
    defenseData.counterValue = damage;//反击伤害
    attack.fightValue.hp = Math.ceil(attack.fightValue.hp - damage);
    //反击触发觉醒技能
    attack.hp = attack.fightValue.hp;
    fightUtil.checkDied(consts.characterFightType.ATTACK, attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
}

/**
 * clearBadStatus 清除不良效果
 * @param player
 * @param players
 */
fightUtil.clearBadStatus = function(player, players) {

}

/**
 * 获得生命值最多的单位
 * @param players
 */
fightUtil.getPlayerWithMaxHp = function(players) {
    var player = null;
    var maxHp = 0;
    for(var i in players) {
        if(players[i].died)
            continue;
        if(players[i].fightValue.hp > maxHp) {
            maxHp = players[i].fightValue.hp;
            player = players[i];
        }
    }
    return player;
}

/**
 * addBuff
 * @param players
 * @param buffId
 * @param buff
 */
fightUtil.addBuff = function(players, buffId, buff) {
    var buffs = [];
    var flag = false;
    for(var i in players) {
        if(players[i].died)
            continue;
        flag = false;
        buffs = players[i].buffs;
        for(var j = 0, l = buffs.length ; j < l ; j++) {
            if(buffs[j].buffId == buffId) {
                buffs[j].buffData = buff.buffData;
                flag = true;
                break;
            }
        }
        if(!flag) {
            players[i].addBuff(buff);
        }
    }
}

/**
 * getHighAttackPlayer
 * @param players
 */
fightUtil.getHighAttackPlayer = function(players) {
    var attack = 0;
    var player = null;
    for(var i in players) {
        if(players[i].died) {
            continue;
        }
        if(players[i].fightValue.attack > attack) {
            player = players[i];
        }
    }
    return player;
}

/**
 * 用于单次攻击
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
fightUtil.attackOnce = function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam) {
    if(attack.died)
        return null;
    if(defense.died)
        return null;
    var triggerCondition = {};

    var fightData = {
        attackSide: attackSide,
        target: [],
        attackTeam: [],
        defenseTeam: []
    };
    var attackData = {};
    var defenseData = {};

    defense.useSkillBuffs(consts.characterFightType.DEFENSE, consts.buffCategory.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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
            fightUtil.counter(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        }

        // 更新数据
        defenseData.fId = defense.formationId;

        fightUtil.reduceHp(attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
        fightUtil.updateDefenseData(defense, defenseData);
        fightUtil.checkDied(consts.characterFightType.DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

        defense.useSkillBuffs(consts.characterFightType.DEFENSE, consts.buffCategory.AFTER_DEFENSE, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);

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
        fightUtil.changeTargetState(target, defenseData);
        fightData.target.push(target);
    }

    // 更新状态
    // 攻方
    // 增加怒气
    fightUtil.addAttackAnger(attack);

    attackData.hp = attack.fightValue.hp;
    attackData.anger = attack.anger;
    attackData.damageType = damageType;
    fightUtil.updateAttackData(attack, attackData);

    fightData.sequence = this.sequence;
    // 写入数据
    if(fightData.attackSide == consts.attackSide.OWNER) {
        fightData.camp = "player";
    } else {
        fightData.camp = "enemy";
    }
    // 攻方
    //data.attackData = attackData;
    fightData.attacker = attack.id;
    fightData.attackerFid = attack.formationId;
    fightData.attackType = attackData.action;
    //data.damageType = attackData.damageType;
    fightData.attackAnger = attackData.anger;
    fightData.hp = attackData.hp;
    fightData.buffs = attackData.buffs;
    fightUtil.changeFightData(fightData, attackData);

    return fightData;
}

fightUtil.getBuffCategory = function(buffType) {
    var buffCategory = 0;
    if(buffType == consts.buffTypeV2.SHIELDS) {//护盾
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.EXTRAARMOR) {//额外护甲
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.BLOCK) {//格挡
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.DODGE) {//闪避
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.ASYLUM) {//庇护
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.ADDMAXHP) {//提升生命上限
        buffCategory = consts.buffCategory.AFTER_DEFENSE;
    } else if(buffType == consts.buffTypeV2.REDUCE_SCOPE_DAMAGE) {//减范围伤害
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.CHANGETO_SCOPE_DAMAGE) {//范围伤害
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.ADDATTACK) {//加攻击力
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.ADDSUNDERARMOR) {//加破甲
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.POISON) {//施毒
        buffCategory = consts.buffCategory.ROUND;
    } else if(buffType == consts.buffTypeV2.ADDHP) {//加血
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.REDUCEATTACK_ADDSUNDERARMOR) {//减伤
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.EXTRATARGET) {//额外目标
        buffCategory = consts.buffCategory.ATTACKING;
    } else if(buffType == consts.buffTypeV2.CHANGETO_SCOPE_DAMAGE_AND_ADDHP) {//范围伤害并加血
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.PARALLELDAMAGE) {//溅射
        buffCategory = consts.buffCategory.ATTACKING;
    } else if(buffType == consts.buffTypeV2.RECOVERYHP) {
        buffCategory = consts.buffCategory.ATTACKING;
    } else if(buffType == consts.buffTypeV2.PROMOTEHP) {//提升血量
        buffCategory = consts.buffCategory.ATTACKING;
    } else if(buffType == consts.buffTypeV2.ADDDODGE) {//提升闪避
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.ICE) {//冰冻
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.SILENCE) {//沉默
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.FREEZE) {//冻结
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.TURN_DAMAGE) {
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.ADDBLOCK) {
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.KING_WILL) {
        buffCategory = consts.buffCategory.AFTER_DIE;
    } else if(buffType == consts.buffTypeV2.ADDDAMAGE) {
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.IMMUNE_FREEZE) {
        //buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.NODAMAGE_EXCEPT_ATTACK) {
        //buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.EXCHANGE_HP_ATTACK) {
        //buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.CHANGETO_SCOPE_DAMAGE_THREETIME) {
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.OFFSET_SHIELDS) {
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.CLEAR_BAD_STATUS) {
        //buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.CLEAR_AWAY) {
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.STUNT) {//禁锢
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.STASIS) {
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.ADDDEFENSE) {
        buffCategory = consts.buffCategory.DEFENSE;
    } else if(buffType == consts.buffTypeV2.REVIVE) {
        buffCategory = consts.buffCategory.ATTACK;
    } else if(buffType == consts.buffTypeV2.ALLFREEZE) {
        buffCategory = consts.buffCategory.AFTER_DIE;
    }
    return buffCategory;
}

fightUtil.getSkillBuff = function(buffType, skill, buffData) {
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
        buffCategory: fightUtil.getBuffCategory(buffType)
    });
    return buff;
}