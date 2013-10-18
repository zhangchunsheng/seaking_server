/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: skillUtil
 */
var Buff = require('../domain/buff');

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
        skillType: activeSkill.skillType,
        skillLevel: activeSkill.skillLevel,
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