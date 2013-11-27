/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-14
 * Description: fightUtil
 */
var consts = require('../consts/constsV2');
var EntityType = require('../consts/consts').EntityType;

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

fightUtil.updateDefenseData = function(defense, defenseData) {
    if(defense.fight.reduceDamageValue > 0) {
        defenseData.reduceDamage = defense.fight.reduceDamageValue;
    }
    if(defense.fight.addDefenseValue > 0) {
        defenseData.addDefense = defense.fight.addDefenseValue;
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