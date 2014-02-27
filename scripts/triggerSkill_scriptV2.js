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

        if(player.fightValue.hp < player.maxHp * 0.5) {
            return true;
        } else {
            return false;
        }
    },
    "skill103101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.2) {
            return true;
        } else {
            return false;
        }
    },
    "skill104101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
     * @returns {boolean}
     */
    "skill104201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.15) {
            return true;
        } else {
            return false;
        }
    },
    "skill105101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.2) {
            return true;
        } else {
            return false;
        }
    },
    "skill106101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        var player;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.1) {
            return true;
        } else {
            return false;
        }
    },
    "skill107101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
     */
    "skill107201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
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
    "skill108101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
     * @returns {boolean}
     */
    "skill108201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp <= 0) {
            return true;
        } else {
            return false;
        }
    },
    "skill109101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
    "skill110101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
    "skill201101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
    "skill202101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
     */
    "skill202201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
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
    "skill203101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.25) {
            return true;
        } else {
            return false;
        }
    },
    "skill204101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.2) {
            return true;
        } else {
            return false;
        }
    },
    "skill205101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.2) {
            return true;
        } else {
            return false;
        }
    },
    "skill206101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
    "skill207101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
    "skill208101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp <= 0) {
            return true;
        } else {
            return false;
        }
    },
    "skill209101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
    "skill210101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp <= 0) {
            return true;
        } else {
            return false;
        }
    },
    "skill211101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.2) {
            return true;
        } else {
            return false;
        }
    },
    "skill301101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

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
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp <= 0) {
            return true;
        } else {
            return false;
        }
    },
    "skill302101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 死亡之后，己方所有单位获得5%的吸血效果
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
    "skill302201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp <= 0) {
            return true;
        } else {
            return false;
        }
    },
    "skill303101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 生命值进入低于40%的状态，下次攻击牺牲所有生命值，对敌方全体造成当前生命值的一半的伤害
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
    "skill303201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
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
    "skill304101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 每损失10%的生命值，己方所有单位护甲提升2%
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
    "skill304201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return true;
    },
    "skill305101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 生命值进入低于20%的状态时，下次攻击将消耗所有生命值，复活上一个死亡的角色，并赋予10%的生命值
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
    "skill305201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var player;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
        } else if(attackSide == constsV2.characterFightType.DEFENSE) {
            player = defense;
        }

        if(player.fightValue.hp < player.maxHp * 0.2) {
            return true;
        } else {
            return false;
        }
    },
    "skill306101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 死亡瞬间，立即使己方攻击力最高的单位发动一次攻击
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
    "skill306201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill307101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 当己方有一个单位死亡时，冻结所有敌方单位，持续1次
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
    "skill307201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "skill308101": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    /**
     * 死亡时，给杀死该单位的目标附加诅咒，该单位下次攻击之后死亡
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
    "skill308201": function(attackSide, condition, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    }
}

module.exports = triggerSkill_script;