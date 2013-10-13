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
var utils = require('../utils/utils');
var skillUtil = require('../utils/skillUtil');
var formationUtil = require('../utils/formationUtil');

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
 * 1己方单体	0~7特定位置，8生命值最少，9生命百分比最少（空 为技能作用自身）
 * 2敌方单体	0~7特定位置，8生命值最少，9生命百分比最少（空 为技能对位优先）
 * 3己方全体
 * 4敌方全体
 * 5己方随机目标	随机数目（从敌方或己方随机取几个目标)
 * 6敌方随机目标	随机数目
 * 7己方特定目标	1周围1格，2正前，3正后，4左侧，5右侧，6前一行，7同行，8后一行
 * 8敌方特定目标	1周围1格，2正前，3正后，4左侧，5右侧，6前一行，7同行，8后一行
 * 9敌方特定目标	1下一格，2下两格，3下三格，4，下四格，5下五格，6下六格
 * 10作用为技能
 */
ActiveSkill.prototype.calculateAddAttack = function(effect, attack_formation, defense_formation, attack, defense, attacks, defenses, fightData) {
    // 攻击力加成
    attack.fightValue.attack += utils.getEffectValue(effect, attack.attack);

    fightData.targetType = consts.attackSide.OPPONENT;

    var fight = {};
    if(effect.targetType == consts.targetType.OWNER_SINGLE) {// target

    } else if(effect.targetType == consts.targetType.OWNER_SPECIFIC) {

    } else if(effect.targetType == consts.targetType.OWNER_RANDOM) {

    } else if(effect.targetType == consts.targetType.OWNER_ALL) {

    } else if(effect.targetType == consts.targetType.OPPONENT_SINGLE) {// 单个目标
        fight.fId = defense.formationId;
        fight.id = defense.id;
        fight.action = consts.defenseAction.beHitted;

        // 计算伤害
        defense.hp = attack.fightValue.attack - defense.fightValue.defense;

        fight.hp = defense.hp;
        fight.anger = defense.anger;

        fightData.target.push(fight);
    } else if(effect.targetType == consts.targetType.OPPONENT_SPECIFIC) {// 特定目标
        // 1周围1格，2正前，3正后，4左侧，5右侧，6前一行，7同行，8后一行
        var target = effect.targetValue;

        if(target == consts.targetSpecialType.AROUND_ONE_CELL) {// 周围1格

        }
    } else if(effect.targetType == consts.targetType.OPPONENT_RANDOM) {// 随机目标
        var positions = [];
        for(var i in defenses) {// key为formationId的json对象
            if(!defenses[i].died) {
                positions.push(i);
            }
        }
        var num = effect.targetValue;

        positions = formationUtil.getRandomPosition(num, positions);

        for(var i = 0 ; i < positions.length ; i++) {
            defense = defenses[positions[i]];

            fight.fId = defense.formationId;
            fight.id = defense.id;
            fight.action = consts.defenseAction.beHitted;

            // 计算伤害
            defense.hp = attack.fightValue.attack - defense.fightValue.defense;

            fight.hp = defense.hp;
            fight.anger = defense.anger;

            fightData.target.push(fight);
        }

    } else if(effect.targetType == consts.targetType.OPPONENT_ALL) {// 敌方所有单位
        for(var i in defenses) {

        }
        fight.fId = defense.formationId;
        fight.id = defense.id;
        fight.action = consts.defenseAction.beHitted;

        // 计算伤害
        defense.hp = attack.fightValue.attack - defense.fightValue.defense;

        fight.hp = defense.hp;
        fight.anger = defense.anger;

        fightData.target.push(fight);
    } else if(effect.targetType == consts.targetType.SKILL) {

    }
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
