/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-13
 * Description: fightV2
 */
var Code = require('../../../shared/code');
var async = require('async');
var utils = require('../../utils/utils');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var EntityType = require('../../consts/consts').EntityType;
var fightReward = require('./fightReward');
var consts = require('../../consts/consts');

var Fight = function(opts) {
    this.mainPlayer = opts.mainPlayer;
    this.owner_formation = opts.owner_formation;
    this.monster_formation = opts.monster_formation;
    this.ownerTeam = opts.ownerTeam;
    this.monsterTeam = opts.monsterTeam;
    this.owners = opts.owners;
    this.monsters = opts.monsters;
    this.players = [];
    this.owner_players = [];
    for(var i in this.owners) {
        this.players.push(this.owners[i]);
    }
    for(var i in this.monsters) {
        this.players.push(this.monsters[i]);
    }
    this.round = 0;
    this.sequence = [];
    this.isWin = false;
};

/**
 * 副本遇怪fight
 */
Fight.prototype.fight = function(cb) {
    var owners = this.owners;
    var monsters = this.monsters;
    var players = this.players;

    var max_time = 30;
    var currentTime = 0;
    var previousTime = 0;
    var battleData = [];
    var attackData = {};
    var defenseData = {};
    var formationId = 0;
    var monsterIndex = 0;
    var attackSide = 1;//1 - 己方 2 - 敌方
    var perDistance = 0;//每一阶段目标

    // players = utils.sortArray(players, "speedLevel", 1); //由大到小排序

    // 更新角色数据
    for(var i in owners) {
        owners[i].updateFightValue();
    }
    for(var i in monsters) {
        monsters[i].updateFightValue();
    }

    // 计算最大速度
    var max_speed = 0;
    for(var i in owners) {
        max_speed = Math.max(max_speed, owners[i].fightValue.speedLevel);
    }
    for(var i in monsters) {
        max_speed = Math.max(max_speed, monsters[i].fightValue.speedLevel);
    }
    perDistance = max_speed;

    var flag = false;
    while(true) {
        this.sequence = [];
        // 判定出手顺序
        for(var i = 0 ; i < players.length ; i++) {
            attackData = {};
            if(!players[i].died) {
                players[i].distance = (players[i].attackers.length + 1) * perDistance;
                players[i].costTime = players[i].distance / players[i].fightValue.speedLevel;
            }
        }
        players = utils.sortArray(players, "costTime");

        //攻击顺序
        for(var i = 0 ; i < players.length ; i++) {
            this.sequence.push(players[i].id);
        }

        currentTime = players[0].costTime;
        flag = this.attack(battleData, players, 0);
        if(currentTime > max_time)
            break;
        if(flag)
            break;
    }

    var that = this;
    for(var i = 0 ; i < this.players.length ; i++) {
        if(this.players[i].type == EntityType.PLAYER || this.players[i].type == EntityType.PARTNER) {
            this.owner_players.push(this.players[i]);
        }
    }
    fightReward.reward(this.mainPlayer, this.owner_players, monsters, this.isWin, function(err, reply) {
        var battleResult = {};
        battleResult.isWin = that.isWin;
        battleResult.getItems = reply;
        // 战斗结果
        var result = {
            "formationData": {
                "owner": that.owner_formation,// array index - 阵型位置 array value - character id
                "monster": that.monster_formation
            },
            battleData: battleData,
            battleResult: battleResult
        };

        utils.invokeCallback(cb, null, result);
    });
};

/**
 * 竞技场pk
 */
Fight.prototype.pk = function(cb) {
    var owners = this.owners;
    var monsters = this.monsters;
    var players = this.players;

    var max_time = 30;
    var currentTime = 0;
    var previousTime = 0;
    var battleData = [];
    var attackData = {};
    var defenseData = {};
    var formationId = 0;
    var monsterIndex = 0;
    var attackSide = 1;//1 - 己方 2 - 敌方
    var perDistance = 0;//每一阶段目标

    // players = utils.sortArray(players, "speedLevel", 1); //由大到小排序

    // 更新角色数据
    for(var i in owners) {
        owners[i].updateFightValue();
    }
    for(var i in monsters) {
        monsters[i].updateFightValue();
    }

    // 计算最大速度
    var max_speed = 0;
    for(var i in owners) {
        max_speed = Math.max(max_speed, owners[i].fightValue.speedLevel);
    }
    for(var i in monsters) {
        max_speed = Math.max(max_speed, monsters[i].fightValue.speedLevel);
    }
    perDistance = max_speed;

    var flag = false;
    while(true) {
        // 判定出手顺序
        for(var i = 0 ; i < players.length ; i++) {
            attackData = {};
            if(!players[i].died) {
                players[i].distance = (players[i].attackers.length + 1) * perDistance;
                players[i].costTime = players[i].distance / players[i].fightValue.speedLevel;
            }
        }
        players = utils.sortArray(players, "costTime");

        //攻击顺序
        for(var i = 0 ; i < players.length ; i++) {
            this.sequence.push(players[i].id);
        }

        currentTime = players[0].costTime;
        flag = this.attack(battleData, players, 0);
        if(currentTime > max_time)
            break;
        if(flag)
            break;
    }

    var that = this;
    for(var i = 0 ; i < this.players.length ; i++) {
        if(this.players[i].type == EntityType.PLAYER || this.players[i].type == EntityType.PARTNER) {
            this.owner_players.push(this.players[i]);
        }
    }
    var battleResult = {};
    battleResult.isWin = that.isWin;
    // 战斗结果
    var result = {
        "formationData": {
            "owner": that.owner_formation,// array index - 阵型位置 array value - character id
            "monster": that.monster_formation
        },
        battleData: battleData,
        battleResult: battleResult
    };

    utils.invokeCallback(cb, null, result);
};

/**
 *
 * @param players
 * @param index
 */
Fight.prototype.attack = function(battleData, players, index) {
    var owners = {};
    var monsters = {};
    var flag = false;
    var data = {};
    var attackData = {};
    var defenseData = {};
    var attack = players[index];
    var defense = {};
    var attacks = {};
    var defences = {};
    var attack_formation = [];
    var defense_formation = [];
    var attackSide = 1;//1 - 己方 2 - 敌方
    var currentTime = attack.costTime;
    var previousTime = 0;
    var attack_action = 0;
    var defense_action = 0;
    var formationId = 0;
    var monsterIndex = 0;
    var attackFightTeam = {};
    var defenseFightTeam = {};

    for(var i = 0 ; i < players.length ; i++) {
        if(players[i].type == EntityType.PLAYER || players[i].type == EntityType.PARTNER) {
            owners[players[i].formationId] = players[i];
        } else {
            monsters[players[i].formationId] = players[i];
        }
    }

    // 更新buff数据
    for(var i in owners) {
        owners[i].calculateBuff();
    }
    for(var i in monsters) {
        monsters[i].calculateBuff();
    }

    if(attack.type == EntityType.PLAYER || attack.type == EntityType.PARTNER) {
        attackSide = consts.attackSide.OWNER;
        attacks = owners;
        defences = monsters;
        attack_formation = this.owner_formation;
        defense_formation = this.monster_formation;
        attackFightTeam = this.ownerTeam;
        defenseFightTeam = this.monsterTeam;
    } else {
        attackSide = consts.attackSide.OPPONENT;
        attacks = monsters;
        defences = owners;
        attack_formation = this.monster_formation;
        defense_formation = this.owner_formation;
        attackFightTeam = this.monsterTeam;
        defenseFightTeam = this.ownerTeam;
    }

    // 作用目标 攻击或技能效果
    data.target = [];

    // 攻方
    data.attackSide = attackSide;
    data.currentTime = currentTime;
    // 守方
    formationId = attack.formationId;
    monsterIndex = this.getEnemyIndex(formationId, defences);
    defense = defences[monsterIndex];

    // 没有敌人战斗结束
    if(monsterIndex == null) {
        if(attackSide == consts.attackSide.OWNER) {
            this.isWin = true;
        } else {
            this.isWin = false;
        }
        flag = true;
        return flag;
    }

    // 阵型位置
    attackData.fId = attack.formationId;

    // test skill
    //attack.anger = 100;

    // 攻击方式
    attack.maxAnger = 10000;
    if(attack.anger >= attack.maxAnger) {// 1 - 普通攻击 2 - 技能攻击
        attackData.action = consts.attackAction.skill;
        if(attack.type == EntityType.MONSTER) {
            attackData.skillId = 0;
        } else {
            attackData.skillId = attack.activeSkill.skillId;
        }
        attack.anger = 0;
    } else {
        attackData.action = consts.attackAction.common;
    }

    attackData.attack = attack.fightValue.attack;
    defenseData.defense = defense.defense;

    var random = 0;

    // 判断闪避、暴击、格挡、普通攻击
    var isCriticalHit = false;
    var isBlock = false;
    var isDodge = false;
    var isCommandAttack = false;
    var damageType = consts.damageType.common;
    //暴击
    var criticalHit = attack.fightValue.criticalHit * 100;
    //格挡
    var block = defense.block * 100;
    //闪避
    var dodgeRate = defense.dodgeRate * 100;
    var num1 = criticalHit + block;
    var num2 = num1 + dodgeRate;
    random = utils.random(1, 10000);
    if(random >= 1 && random <= criticalHit) {
        isCriticalHit = true;
        damageType = consts.damageType.criticalHit;
    } else if(random > criticalHit && random <= num1) {
        isBlock = true;
    } else if(random > num1 && random <= num2) {
        isDodge = true;
    } else {
        isCommandAttack = true;
    }

    // 判定是否闪避
    // random = utils.random(1, 10000);
    if(isDodge) {// 闪避
        defenseData.action = consts.defenseAction.dodge;//1 - 被击中 2 - 闪避 3 - 被击中反击
        defenseData.reduceBlood = 0;

        // 守方
        // 增加怒气
        if(attackData.action == consts.attackAction.common) {// each hit received
            if(defense.type == EntityType.MONSTER) {
                defense.anger += defense.restoreAngerSpeed.ehr;
            } else {
                defense.anger += defense.restoreAngerSpeed.ehr;
            }
        } else if(attackData.action == consts.attackAction.skill) {// each skill hit received
            if(defense.type == EntityType.MONSTER) {
                defense.anger += defense.restoreAngerSpeed.eshr;
            } else {
                defense.anger += defense.restoreAngerSpeed.eshr;
            }
        }

        defenseData.hp = defense.hp;
        defenseData.hp = defense.anger;

        data.targetType = consts.effectTargetType.OPPONENT;
        var target = {
            id: defense.id,
            fId: defense.formationId,
            action: defenseData.action,
            hp: defenseData.hp,
            anger: defenseData.anger
        };
        data.target.push(target);
    } else {
        if(attackData.action == consts.attackAction.skill) {//技能攻击
            damageType = consts.damageType.common;
            //计算攻击力 技能加成
            if(attack.type == EntityType.MONSTER) {

            } else {
                attack.activeSkillAdditional();
                attackData.attack = attack.fightValue.attack;
                attackData.buffs = [];
                defenseData.groupDamage = {};
                defenseData.buffs = [];
            }
            //计算防御
            defenseData.defense = defense.defense;

            attack.useActiveSkill(attack_formation, defense_formation, attack, defense, attacks, defences, attackFightTeam, defenseFightTeam, data, attackData, defenseData);
        } else {
            // 判定是否暴击
            // random = utils.random(1, 10000);
            if(isCriticalHit) {// 暴击
                attackData.isCritHit = true;
                attackData.attack += (attackData.attack * attack.fightValue.critDamage / 100);
            }

            defenseData.action = consts.defenseAction.beHitted;

            // 判定是否格挡
            // random = utils.random(1, 10000);
            if(isBlock) {// 格挡
                attackData.attack = attackData.attack / 2;
                defenseData.isBlock = true;
                defenseData.action = consts.defenseAction.block;
            }

            // attackData.hasBuff = true;// buff，可以有多个buff

            defenseData.reduceBlood = attackData.attack - defenseData.defense;
            if(defenseData.reduceBlood < 0) {
                defenseData.reduceBlood = 0;
            }

            // 更新状态
            // 攻方

            // 守方

            // 判定是否反击
            var counterAttack = defense.counterAttack * 100;
            random = utils.random(1, 10000);
            if(random >= 1 && random <= counterAttack) {// 反击
                var damage = defense.attack * 25 / 100;
                defenseData.isCounter = true;
                defenseData.counterValue = damage;//反击伤害
                attack.hp -= damage;
                if(attack.hp <= 0) {
                    attack.hp = 0;
                    attack.died = attackData.died = true;
                    attack.costTime = 10000;
                }
            }

            // 更新数据
            defenseData.fId = monsterIndex;

            defense.hp -= defenseData.reduceBlood;
            if(defense.hp <= 0) {
                defense.hp = 0;
                defense.died = defenseData.died = true;
                defense.costTime = 10000;
            }

            // 守方
            // 增加怒气
            if(attackData.action == consts.attackAction.common) {// each hit received
                if(defense.type == EntityType.MONSTER) {
                    defense.anger += defense.restoreAngerSpeed.ehr;
                } else {
                    defense.anger += defense.restoreAngerSpeed.ehr;
                }
            } else if(attackData.action == consts.attackAction.skill) {// each skill hit received
                if(defense.type == EntityType.MONSTER) {
                    defense.anger += defense.restoreAngerSpeed.eshr;
                } else {
                    defense.anger += defense.restoreAngerSpeed.eshr;
                }
            }

            // 更新状态
            defenseData.hp = defense.hp;
            defenseData.anger = defense.anger;

            data.targetType = consts.effectTargetType.OPPONENT;
            var target = {
                id: defense.id,
                fId: defense.formationId,
                action: defenseData.action,
                hp: defenseData.hp,
                anger: defenseData.anger
            };
            if(defenseData.isCounter) {
                target.isCounter = true;
                target.counterValue = defenseData.counterValue;
            }
            data.target.push(target);
        }
    }

    // 更新数据
    if(battleData.length > 0) {
        previousTime = battleData[battleData.length - 1].currentTime;
    }
    data.delayTime = currentTime - previousTime;

    // 更新状态
    // 攻方
    // 增加怒气
    if(attack.type == EntityType.MONSTER) {
        attack.anger += attack.restoreAngerSpeed.ea;
    } else {
        attack.anger += attack.restoreAngerSpeed.ea;
    }

    attackData.hp = attack.hp;
    attackData.anger = attack.anger;
    attackData.damageType = damageType;

    data.sequence = this.sequence;
    // 写入数据
    if(data.attackSide == consts.attackSide.OWNER) {
        data.camp = "player";
    } else {
        data.camp = "enemy";
    }
    // 攻方
    //data.attackData = attackData;
    data.attacker = attack.id;
    data.attackerFid = attack.formationId;
    data.attackType = attackData.action;
    data.damageType = attackData.damageType;
    data.attackAnger = attackData.anger;
    // 守方
    //data.defenseData = defenseData;

    battleData.push(data);

    attack.attackers.push({
        currentTime: attack.costTime,
        monsterIndex: monsterIndex
    });
    this.round++;

    if(index + 1 == players.length) {
        return false;
    } else {
        if(players[index + 1].costTime == players[index].costTime) {
            var playerId = this.sequence.shift();
            this.sequence.push(playerId);
            return this.attack(battleData, players, index + 1);
        } else {
            return false;
        }
    }

};

/**
 *
 * @param formationId
 * @param monsters
 * @returns {number}
 */
Fight.prototype.getEnemyIndex = function(formationId, monsters, count) {
    var monsterIndex = 0;
    if(!count) {
        count = 1;
    } else {
        count++;
    }
    if(monsters[formationId] && !monsters[formationId].died) {
        monsterIndex = formationId;
        return monsterIndex;
    } else {
        monsterIndex = 0;
        if(monsters[monsterIndex] && !monsters[monsterIndex].died) {
            return monsterIndex;
        } else {
            formationId++;
            if(count <= 7) {
                if(formationId == 7) {
                    formationId = 0;
                }
                return this.getEnemyIndex(formationId, monsters, count);
            } else {
                return null;
            }
        }
    }
    return null;
}

Fight.createCharacter = function(opts) {
    var heros = dataApi.heros.data;
    var hero = heros[opts.id];
    var data = {
        id: opts.id,
        cId: opts.cId,
        kindId: opts.id,
        formationId: opts.formationId,
        type: opts.type,
        xpNeeded: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, opts.level),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        anger: 0,
        maxAnger: 100,
        restoreAngerSpeed: {ea:10, ehr: 3, eshr: 6},
        attackers: [],
        costTime: 0,
        distance: 0,
        died: false,
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        restoreHpSpeed: 10,
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), opts.level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), opts.level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), opts.level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), opts.level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), opts.level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), opts.level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), opts.level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), opts.level),
        level: opts.level
    };
    data.fightValue = {};
    data.fightValue.attack = Math.floor(data.attack);
    data.fightValue.defense = Math.floor(data.defense);
    data.fightValue.speedLevel = Math.floor(data.speedLevel);
    data.fightValue.hp = data.hp;
    data.fightValue.maxHp = data.hp;
    data.fightValue.focus = data.focus;
    data.fightValue.criticalHit = data.criticalHit;
    data.fightValue.critDamage = data.critDamage;
    data.fightValue.dodge = data.dodge;
    data.fightValue.block = data.block;
    data.fightValue.counter = data.counter;
    return data;
}

Fight.createMonster = function(opts) {
    var monsters = dataApi.monster.data;
    var monster = monsters[opts.id];
    var data = {
        id: opts.id,
        kindId: opts.id,
        formationId: opts.formationId,
        type: opts.type,
        hp: monster.hp,
        anger: 0,
        maxAnger: 100,
        restoreAngerSpeed: {ea:10, ehr: 3, eshr: 6},
        attackers: [],
        costTime: 0,
        distance: 0,
        died: false,
        maxHp: monster.hp,
        restoreHpSpeed: 10,
        attack: monster.attack,
        defense: monster.defense,
        focus: monster.focus,
        speedLevel: monster.speed,
        speed: monster.speed,
        dodge: monster.dodge,
        criticalHit: 1,
        critDamage: monster.critDamage,
        block: monster.block,
        counter: monster.counter,
        level: monster.level
    };
    data.fightValue = {};
    data.fightValue.attack = Math.floor(data.attack);
    data.fightValue.defense = Math.floor(data.defense);
    data.fightValue.speedLevel = Math.floor(data.speedLevel);
    data.fightValue.hp = data.hp;
    data.fightValue.maxHp = data.hp;
    data.fightValue.focus = data.focus;
    data.fightValue.criticalHit = data.criticalHit;
    data.fightValue.critDamage = data.critDamage;
    data.fightValue.dodge = data.dodge;
    data.fightValue.block = data.block;
    data.fightValue.counter = data.counter;
    return data;
}

Fight.createTestCharacter = function(opts) {
    var heros = dataApi.heros.data;
    var hero = heros[opts.id];
    var data = {
        id: opts.id,
        cId: opts.cId,
        kindId: opts.id,
        formationId: opts.formationId,
        type: opts.type,
        xpNeeded: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, opts.level),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        anger: 0,
        maxAnger: 100,
        restoreAngerSpeed: {ea:10, ehr: 3, eshr: 6},
        attackers: [],
        costTime: 0,
        distance: 0,
        died: false,
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        restoreHpSpeed: 10,
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), opts.level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), opts.level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), opts.level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), opts.level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), opts.level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), opts.level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), opts.level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), opts.level),
        level: opts.level
    };
    data.fightValue = {};
    data.fightValue.attack = Math.floor(data.attack);
    data.fightValue.defense = Math.floor(data.defense);
    data.fightValue.speedLevel = Math.floor(data.speedLevel);
    data.fightValue.hp = data.hp;
    data.fightValue.maxHp = data.hp;
    data.fightValue.focus = data.focus;
    data.fightValue.criticalHit = data.criticalHit;
    data.fightValue.critDamage = data.critDamage;
    data.fightValue.dodge = data.dodge;
    data.fightValue.block = data.block;
    data.fightValue.counter = data.counter;
    return data;
}

Fight.createTestMonster = function(opts) {
    var monsters = dataApi.monster.data;
    var monster = monsters[opts.id];
    var data =  {
        id: opts.id,
        kindId: opts.id,
        formationId: opts.formationId,
        type: opts.type,
        hp: monster.hp,
        anger: 0,
        maxAnger: 100,
        restoreAngerSpeed: {ea:10, ehr: 3, eshr: 6},
        attackers: [],
        costTime: 0,
        distance: 0,
        died: false,
        maxHp: monster.hp,
        restoreHpSpeed: 10,
        attack: monster.attack,
        defense: monster.defense,
        focus: monster.focus,
        speedLevel: monster.speed,
        speed: monster.speed,
        dodge: monster.dodge,
        criticalHit: 1,
        critDamage: monster.critDamage,
        block: monster.block,
        counter: monster.counter,
        level: monster.level
    };
    data.fightValue = {};
    data.fightValue.attack = Math.floor(data.attack);
    data.fightValue.defense = Math.floor(data.defense);
    data.fightValue.speedLevel = Math.floor(data.speedLevel);
    data.fightValue.hp = data.hp;
    data.fightValue.maxHp = data.hp;
    data.fightValue.focus = data.focus;
    data.fightValue.criticalHit = data.criticalHit;
    data.fightValue.critDamage = data.critDamage;
    data.fightValue.dodge = data.dodge;
    data.fightValue.block = data.block;
    data.fightValue.counter = data.counter;

    return data;
}

module.exports = Fight;