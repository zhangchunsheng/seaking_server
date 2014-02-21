/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-23
 * Description: buff_scriptV2
 */
var utils = require('../app/utils/utils');
var fightUtil = require('../app/utils/fightUtil');
var buffUtil = require('../app/utils/buffUtil');
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
        return 0;
    },
    "buff101201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff102101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamage += this.buffData.value;
        defense.removeBuff(this);
        return 0;
    },
    /**
     * 生命值低于30%之后，会产生一个持久性的护盾，该护盾使受到的攻击伤害减免25%
     * @param attackSide
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
    "buff102201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        //defense.fight.reduceDamagePerpetual = this.buffData.value;
        defense.fight.reduceDamage += this.buffData.value;//reset
        return 0;
    },
    "buff103101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamageOverlay = this.buffData.value;
        defense.fight.reduceDamage += this.buffData.value;
        return 0;
    },
    /**
     * 生命值低于20%之后，攻击该单位的目标有50%的几率被冻结一回合
     * @param attackSide
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
    "buff103201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        //check immute_freeze
        var buffs = defense.buffs;
        var immuteFreezeBuff = buffUtil.getBuff("203201", buffs);//skillId  SK101201
        if(typeof immuteFreezeBuff.buffData != "undefined") {
            return 0;
        }
        var random = utils.random(1, 100);
        if(random >= 1 && random <= 50) {
            return 1;
        } else {
            return 0;
        }
    },
    /**
     * 抵消伤害
     */
    "buff104101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.reduceDamageCounteract = this.buffData.value;
        defenseFightTeam.removeBuff(this);
        return -1;
    },
    /**
     * 生命值进入低于15%的状态，立即对己方施放一个可以抵挡3次任何攻击的护盾
     * @param attackSide
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
     * @returns {number}
     */
    "buff104201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        if(this.buffData.value > 0) {
            this.buffData.value--;
        }
        if(this.buffData.value <= 0) {
            defenseFightTeam.removeBuff(this);
        }
        return 1;
    },
    "buff105101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.addDefense += this.buffData.value;
        return 0;
    },
    /**
     * 生命值进入低于20%的状态，立即消耗所有的额外的护甲，给自己加为对应点数*10的生命值（只能触发一次）
     * @param attackSide
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
    "buff105201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff106101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.isBlock = true;
        defense.removeBuff(this);
        return 0;
    },
    "buff106201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff107101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.isDodge = true;
        defense.removeBuff(this);
        return 0;
    },
    "buff107201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff108101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.asylumTransfer = this.buffData.asylumTransfer;
        defense.removeBuff(this);
        return 0;
    },
    "buff108201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        if(this.buffData.value <= 0) {
            return 0;
        }
        var player;
        var playerData;
        if(attackSide == constsV2.characterFightType.ATTACK) {
            player = attack;
            playerData = attackData;
        } else {
            player = defense;
            playerData = defenseData;
        }

        if(this.buffData.value > 0) {
            this.buffData.value--;
        }
        player.fightValue.hp = 1;
        player.died = playerData.died = false;
        player.costTime = player.fight.costTime;
        return 0;
    },
    "buff109101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        if(defense.died) {
            return 0;
        }
        var addMaxHp = defense.maxHp * this.buffData.value;
        defense.fightValue.maxHp += addMaxHp;
        defense.fightValue.hp += addMaxHp;
        defense.fight.addMaxHp = 0;
        return 0;
    },
    "buff109201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff110101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        if(attack.fightValue.attackType != constsV2.attackType.ALL) {
            return 0;
        }
    },
    "buff110201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff201101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addAttack += this.buffData.value;
        attack.removeBuff(this);
        return 0;
    },
    "buff201201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff202101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff202201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addDamage = this.buffData.value;
        return 0;
    },
    "buff203101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addHp += this.buffData.value;
        return 0;
    },
    "buff203201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff204101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addSunderArmor += this.buffData.value;
        return 0;
    },
    "buff204201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff205101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addSunderArmor += this.buffData.value;
        attack.removeBuff(this);
        return 0;
    },
    "buff205201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff206101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.reduceAttack += this.buffData.reduceAttack;
        attack.fight.addSunderArmor += this.buffData.addSunderArmor;
        return 0;
    },
    "buff206201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff207101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fightValue.attackType = constsV2.attackType.ALL;
        attack.fightValue.attack = attack.fightValue.attack * this.buffData.value;

        attackData.attack = attack.fightValue.attack;
        attackData.buffs = attack.getBuffs();
        fightData.targetType = constsV2.effectTargetType.OPPONENT;

        var player = fightUtil.checkReduceScopeDamage(defenses);
        var opts;
        if(player != null) {
            opts = {
                type: constsV2.buffTypeV2.REDUCE_SCOPE_DAMAGE,
                player: player,
                damage: 0,
                damageInfo: []
            };
            for(var i in defenses) {
                fightUtil.calculateDamage(opts, attackSide, attack_formation, defense_formation, attack, defenses[i], attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
            fightUtil.calculateScopeDamage(opts, this, defense, defenseData, fightData);
        } else {
            opts = {
                damage: 0,
                damageInfo: []
            };
            for(var i in defenses) {
                fightUtil.attack(opts, attackSide, attack_formation, defense_formation, attack, defenses[i], attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
        }

        return 1;
    },
    "buff207201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff208101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var theTarget = fightData.target;
        if(theTarget.length == 0)
            return;
        theTarget = theTarget[0];

        var player = fightUtil.getRandomPlayer(defense, defenses);
        if(player == null)
            return;
        var damage = defenseData.reduceBlood * this.buffData.value;
        if(damage < 0)
            damage = 0;
        fightUtil.calculateHp(player, damage);
        var target = {
            id: player.id,
            damageType: constsV2.damageType.extraDamage,
            fId: player.formationId,
            action: constsV2.defenseAction.beHitted,
            hp: player.hp,
            reduceBlood: damage,
            buffs: player.buffs
        };
        fightData.target.push(target);
    },
    "buff208201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff209101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fightValue.attackType = constsV2.attackType.ALL;
        attack.fightValue.attack = attack.fightValue.attack * this.buffData.value;
        if(this.buffData.addHp) {
            attack.fight.addHp = this.buffData.addHp;
        }

        attackData.attack = attack.fightValue.attack;
        attackData.buffs = attack.getBuffs();
        fightData.targetType = constsV2.effectTargetType.OPPONENT;

        var player = fightUtil.checkReduceScopeDamage(defenses);
        var opts = {};
        if(player != null) {
            opts = {
                type: constsV2.buffTypeV2.REDUCE_SCOPE_DAMAGE,
                player: player,
                damage: 0,
                damageInfo: []
            };
            for(var i in defenses) {
                fightUtil.calculateDamage(opts, attackSide, attack_formation, defense_formation, attack, defenses[i], attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
            fightUtil.calculateScopeDamage(opts, this, defense, defenseData, fightData);
        } else {
            opts = {
                damage: 0,
                damageInfo: []
            };
            for(var i in defenses) {
                fightUtil.attack(opts, attackSide, attack_formation, defense_formation, attack, defenses[i], attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData);
            }
        }

        if(attack.fight.addHp) {
            attack.fight.addHpValue = opts.damage * attack.fight.addHp;
        }

        fightData.addHp = attack.fight.addHpValue;

        return 1;
    },
    "buff209201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff210101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var theTarget = fightData.target;
        if(theTarget.length == 0)
            return;
        theTarget = theTarget[0];

        var damage = defenseData.reduceBlood * this.buffData.value;
        if(damage < 0)
            damage = 0;
        var players = fightUtil.getOtherPlayers(defense, defenses);
        var player;
        var target = {};
        for(var i = 0 ; i < players.length ; i++) {
            player = players[i];
            fightUtil.calculateHp(player, damage);
            target = {
                id: player.id,
                damageType: constsV2.damageType.parallelDamage,
                fId: player.formationId,
                action: constsV2.defenseAction.beHitted,
                hp: player.hp,
                reduceBlood: damage,
                buffs: player.buffs
            };
            fightData.target.push(target);
        }
    },
    "buff210201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff211101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addAttack += this.buffData.value;
        return 0;
    },
    "buff211201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff301101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        var key = "attackTeam";
        var player;
        player = fightUtil.getRandomPlayer(null, attacks);
        if(player == null)
            return;
        var addHp = defenseData.reduceBlood * this.buffData.value;
        fightUtil.addHp(player, addHp);
        fightData[key].push({
            id: player.id,
            fId: player.formationId,
            addHp: addHp,
            buffs: player.buffs
        });
        attack.removeBuff(this);
        return 0;
    },
    "buff301201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff302101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addHp += this.buffData.value;
        attack.removeBuff(this);
        return 0;
    },
    "buff302201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff303101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.promoteHp += this.buffData.value;
        attack.fight.promoteHpValue += attack.maxHp * attack.fight.promoteHp;
        fightUtil.addHp(attack, attack.fight.promoteHpValue);
        fightData.promoteHp = attack.fight.promoteHpValue;
        attack.removeBuff(this);
        return 0;
    },
    "buff303201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff304101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.addAttack += this.buffData.value;
        return 0;
    },
    "buff304201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff305101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {

    },
    "buff305201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff306101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        defense.fight.addDodge += this.buffData.value;
        defense.removeBuff(this);
        return 0;
    },
    "buff306201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff307101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.ice = true;
        attack.removeBuff(this);
        return 1;
    },
    "buff307201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    },
    "buff308101": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        attack.fight.silence = true;
        attack.removeBuff(this);
        return 1;
    },
    "buff308201": function(attackSide, attack_formation, defense_formation, attack, defense, attacks, defenses, attackFightTeam, defenseFightTeam, fightData, attackData, defenseData) {
        return 0;
    }
}

module.exports = buff_script;