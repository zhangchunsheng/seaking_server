/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-23
 * Description: buff_scriptV2
 */
var utils = require('../app/utils/utils');
var constsV2 = require('../app/consts/constsV2');

var buff_script = {
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
    "buff101101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamage += this.buffData.value;
        defense.removeBuff(this);
    },
    "buff101201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff102101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamage += this.buffData.value;
        defense.removeBuff(this);
    },
    "buff102201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff103101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamageOverlay = this.buffData.value;
        defense.fight.reduceDamage += this.buffData.value;
    },
    "buff103201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff104101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamageCounteract = this.buffData.value;
        defenseFightTeam.removeBuff(this);
    },
    "buff104201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff105101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.addDefense = this.buffData.value;
    },
    "buff105201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff106101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.isBlock = true;
        defense.removeBuff(this);
    },
    "buff106201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff107101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.isDodge = true;
        defense.removeBuff(this);
    },
    "buff107201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff108101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.asylumTransfer = this.buffData.asylumTransfer;
        defense.removeBuff(this);
    },
    "buff108201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff109101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff109201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff110101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff110201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff201101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff201201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff202101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff202201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff203101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff203201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff204101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff204201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff205101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff205201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff206101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff206201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff207101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff207201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff208101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff208201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff209101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff209201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff210101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff210201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff211101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff211201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff301101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff301201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff302101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff302201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff303101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff303201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff304101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff304201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff305101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff305201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff306101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff306201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff307101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff307201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff308101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff308201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    }
}

module.exports = buff_script;