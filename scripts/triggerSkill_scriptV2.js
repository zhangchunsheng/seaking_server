/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-21
 * Description: triggerSkill_scriptV2
 */
var Buff = require('../app/domain/buff');
var BuffV2 = require('../app/domain/buffV2');
var utils = require('../app/utils/utils');
var fightUtil = require('../app/utils/fightUtil');
var constsV2 = require('../app/consts/constsV2');

/**
 * 触发技能
 */
var triggerSkill_script = {
    "skill101101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }
        if(player.fightValue.hp < player.maxHp * 0.4) {
            return true;
        } else {
            return false;
        }
    },
    "skill102101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }
        if(player.fightValue.hp < player.maxHp * 0.3) {
            return true;
        } else {
            return false;
        }
    },
    "skill103101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill103201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill104101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill104201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill105101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill105201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill106101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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

module.exports = triggerSkill_script;