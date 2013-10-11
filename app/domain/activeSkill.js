/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: fightskill
 */

var util = require('util');
var dataApi = require('../utils/dataApi');
var formula = require('../consts/formula');
var consts = require('../consts/consts');
var buff = require('./buff');
var Skill = require('./skill');

/**
 *
 * @param attacker
 * @param target
 * @param buff
 * @returns {{result: *}}
 */
var addBuff = function(attacker, target, buff) {
    if (buff.target === 'attacker' && !attacker.died) {
        buff.use(attacker);
    } else if (buff.target === 'target' && !target.died) {
        buff.use(target);
    }
    return {
        result: consts.AttackResult.SUCCESS
    };
};

var removeBuff = function(attacker, target, buff) {

};

/**
 *
 * @param opts
 * @constructor
 */
var ActiveSkill = function(opts) {
    Skill.call(this, opts);
};

/**
 *
 */
ActiveSkill.prototype.calculateHp = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算攻击
 */
ActiveSkill.prototype.calculateAttack = function(effect, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {
    if(effect.targetType == consts.targetType.OWNER_SINGLE) {

    } else if(effect.targetType == consts.targetType.OWNER_SPECIFIC) {

    } else if(effect.targetType == consts.targetType.OWNER_RANDOM) {

    } else if(effect.targetType == consts.targetType.OWNER_ALL) {
        if(effect.timeType == consts.timeType.ROUND) {

        } else if(effect.timeType == consts.timeType.COUNT) {

        }
    } else if(effect.targetType == consts.targetType.OPPONENT_SINGLE) {

    } else if(effect.targetType == consts.targetType.OPPONENT_SPECIFIC) {

    } else if(effect.targetType == consts.targetType.OPPONENT_RANDOM) {

    } else if(effect.targetType == consts.targetType.OPPONENT_ALL) {

    } else if(effect.targetType == consts.targetType.SKILL) {

    }
}

/**
 * 增加自身攻击力
 */
ActiveSkill.prototype.calculateAddAttack = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算防御
 */
ActiveSkill.prototype.calculateDefense = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算目标
 */
ActiveSkill.prototype.calculateTarget = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算集中值
 */
ActiveSkill.prototype.calculateFocus = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算速度
 */
ActiveSkill.prototype.calculateSpeed = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算闪避
 */
ActiveSkill.prototype.calculateDodge = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算暴击几率
 */
ActiveSkill.prototype.calculateCriticalHit = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算暴击几率
 */
ActiveSkill.prototype.calculateCritDamage = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算格挡
 */
ActiveSkill.prototype.calculateBlock = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 计算反击
 */
ActiveSkill.prototype.calculateCounter = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 格挡focus加成
 */
ActiveSkill.prototype.calculateBlockFocus = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 反击focus加成
 */
ActiveSkill.prototype.calculateCounterFocus = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 暴击focus加成
 */
ActiveSkill.prototype.calculateCriticalHitFocus = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 主动技能攻击
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.attack = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 溅射
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.parallelDamage = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {
    fightData.target.push();
}

/**
 * 点燃
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.burn = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 禁锢
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.stunt = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 施毒
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.poison = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 迷惑
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.confusion = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 反弹伤害
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.bounceAttack = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 吸血
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.addBlood = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 冰冻
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.ice = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

/**
 * 复活
 * @param attack_formation
 * @param defense_formation
 * @param attack
 * @param defense
 * @param attacks
 * @param defenses
 * @param fightData
 */
ActiveSkill.prototype.revive = function(attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {

}

ActiveSkill.create = function(opts) {

}

util.inherits(ActiveSkill, Skill);

module.exports = ActiveSkill;
