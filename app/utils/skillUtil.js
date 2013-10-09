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

skillUtil.getBuff = function(effect, passiveSkill) {
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