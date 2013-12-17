/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: skillUtil
 */
var Buff = require('../domain/buff');
var consts = require('../consts/consts');

var skillUtil = module.exports;

skillUtil.calculateAttack = function() {

}

skillUtil.getBuff = function(effect, skill) {
    var buff = new Buff({
        useEffectId: effect.id,
        type: effect.attr,
        skillId: skill.skillId,
        skillType: skill.skillType,
        skillLevel: skill.skillLevel,
        skillData: skill.skillData,
        buffData: effect
    });
    return buff;
}

/**
 * 主动技能buff
 * @param effect
 * @param activeSkill
 */
skillUtil.getActiveSkillBuff = function(effect, buffType, activeSkill) {
    var buff = new Buff({
        useEffectId: effect.id,
        type: effect.attr,
        skillId: activeSkill.skillId,
        skillType: activeSkill.type,
        skillLevel: activeSkill.level,
        skillData: activeSkill.skillData,
        buffData: effect,
        buffType: buffType,
        timeType: effect.timeType,
        timeValue: effect.timeValue
    });
    return buff;
}

/**
 * 被动技能buff
 * @param effect
 * @param passiveSkill
 * @returns {Buff}
 */
skillUtil.getPassiveSkillBuff = function(effect, passiveSkill) {
    var buff = new Buff({
        useEffectId: effect.id,
        type: effect.attr,
        skillId: passiveSkill.skillId,
        skillType: passiveSkill.skillType,
        skillLevel: passiveSkill.skillLevel,
        skillData: passiveSkill.skillData,
        buffData: effect
    });
    return buff;
}

/**
 * 触发技能
 * @param skill
 * @param condition
 * @returns {boolean}
 */
skillUtil.checkTriggerCondition = function(skill, condition) {
    var type = condition.type;
    var triggerCondition = skill.skillData.triggerCondition;
    if(triggerCondition.indexOf("||") > 0) {
        var array = triggerCondition.split("||");
        for(var i = 0 ; i < array.length ; i++) {
            if(array[i] == type)
                return true;
        }
    } else {
        return triggerCondition == type;
    }
    return false;
}

/**
 * 觉醒技能
 * @returns {boolean}
 */
skillUtil.checkAwakenCondition = function(skill, attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
    return skill.invokeTriggerScript(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
}