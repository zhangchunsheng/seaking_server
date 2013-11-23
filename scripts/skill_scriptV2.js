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
        buffType: buffType
    });
    console.log(buff);
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
    "skill101101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {
        console.log(this);
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 75) {
            var buffs = attack.buffs;
            for(var i = 0, l = buffs.length ; i < l ; i++) {
                if(buffs[i].buffId == this.skillId) {
                    return 100;
                }
            }
            var buffData = {
                value: 20
            };
            var buff = getSkillBuff(constsV2.buffTypeV2.SHIELDS, this, buffData);
            attack.addBuff(buff);
            return 100;
        } else {
            return 0;
        }
    },
    "skill101201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill102101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill102201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill103101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill103201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill104101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill104201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill105101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill105201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill106101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill106201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill107101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill107201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill108101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill108201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill109101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill109201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill110101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill110201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill201101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill201201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill202101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill202201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill203101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill203201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill204101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill204201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill205101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill205201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill206101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill206201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill207101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill207201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill208101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill208201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill209101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill209201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill210101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill210201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill211101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill211201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill301101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill301201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill302101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill302201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill303101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill303201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill304101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill304201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill305101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill305201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill306101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill306201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill307101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill307201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill308101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    },
    "skill308201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

    }
}

module.exports = skill_script;