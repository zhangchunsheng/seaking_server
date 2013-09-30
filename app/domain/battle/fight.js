/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-02
 * Description: fight
 */
var Code = require('../../../shared/code');
var async = require('async');
var utils = require('../../utils/utils');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var EntityType = require('../../consts/consts').EntityType;
var fightReward = require('./fightReward');

var Fight = function(opts) {
    this.mainPlayer = opts.mainPlayer;
    this.owner_formation = opts.owner_formation;
    this.monster_formation = opts.monster_formation;
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
    this.isWin = false;
};

/**
 * fight
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
        max_speed = Math.max(max_speed, owners[i].speedLevel);
    }
    for(var i in monsters) {
        max_speed = Math.max(max_speed, monsters[i].speedLevel);
    }
    perDistance = max_speed;

    var flag = false;
    while(true) {
        // 判定出手顺序
        for(var i = 0 ; i < players.length ; i++) {
            attackData = {};
            if(!players[i].died) {
                players[i].distance = (players[i].attackers.length + 1) * perDistance;
                players[i].costTime = players[i].distance / players[i].speedLevel;
            }
        }
        players = utils.sortArray(players, "costTime");
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
 * pk
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

    // 计算最大速度
    var max_speed = 0;
    for(var i in owners) {
        max_speed = Math.max(max_speed, owners[i].speedLevel);
    }
    for(var i in monsters) {
        max_speed = Math.max(max_speed, monsters[i].speedLevel);
    }
    perDistance = max_speed;

    var flag = false;
    while(true) {
        // 判定出手顺序
        for(var i = 0 ; i < players.length ; i++) {
            attackData = {};
            if(!players[i].died) {
                players[i].distance = (players[i].attackers.length + 1) * perDistance;
                players[i].costTime = players[i].distance / players[i].speedLevel;
            }
        }
        players = utils.sortArray(players, "costTime");
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
    var attackSide = 1;//1 - 己方 2 - 敌方
    var currentTime = attack.costTime;
    var previousTime = 0;
    var attack_action = 0;
    var defense_action = 0;

    for(var i = 0 ; i < players.length ; i++) {
        if(players[i].type == EntityType.PLAYER || players[i].type == EntityType.PARTNER) {
            owners[players[i].formationId] = players[i];
        } else {
            monsters[players[i].formationId] = players[i];
        }
    }

    if(attack.type == EntityType.PLAYER || attack.type == EntityType.PARTNER) {
        attackSide = 1;
        attacks = owners;
        defences = monsters;
    } else {
        attackSide = 2;
        attacks = monsters;
        defences = owners;
    }

    // 攻方
    data.attackSide = attackSide;
    data.currentTime = currentTime;
    // 守方
    formationId = attack.formationId;
    monsterIndex = this.getEnemyIndex(formationId, defences);
    defense = defences[monsterIndex];

    // 没有敌人战斗结束
    if(monsterIndex == null) {
        if(attackSide == 1) {
            this.isWin = true;
        } else {
            this.isWin = false;
        }
        flag = true;
        return flag;
    }

    // 阵型位置
    attackData.fId = attack.formationId;

    attack.anger = 100;
    // 攻击方式
    if(attack.anger >= attack.maxAnger) {// 1 - 普通攻击 2 - 技能攻击
        attackData.action = 2;
        if(attack.type == EntityType.MONSTER) {
            attackData.skillId = 0;
        } else {
            attackData.skillId = attack.activeSkill.skillId;
        }
        attack.anger = 0;
    } else {
        attackData.action = 1;
    }

    attackData.attack = attack.fightValue.attack;
    defenseData.defense = defense.defense;

    var random = 0;
    // 判定是否闪避
    var dodgeRate = defense.dodgeRate * 100;
    random = utils.random(1, 10000);
    if(random >= 1 && random <= dodgeRate) {// 闪避
        defenseData.action = 2;//1 - 被击中 2 - 闪避 3 - 被击中反击
        defenseData.reduceBlood = 0;
    } else {
        if(attackData.action == 2) {//技能攻击
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
        } else {
            // 判定是否暴击
            var criticalHit = attack.fightValue.criticalHit * 100;
            random = utils.random(1, 10000);
            if(random >= 1 && random <= criticalHit) {// 暴击
                attackData.isCritHit = true;
                attackData.attack += (attackData.attack * attack.fightValue.critDamage / 100);
            }

            defenseData.action = 1;
            // 判定是否格挡
            var block = defense.block * 100;
            random = utils.random(1, 10000);
            if(random >= 1 && random <= block) {// 格挡
                attackData.attack = attackData.attack / 2;
                defenseData.isBlock = true;
            }

            // attackData.hasBuff = true;// buff，可以有多个buff

        }

        defenseData.reduceBlood = attackData.attack - defenseData.defense;
        if(defenseData.reduceBlood < 0) {
            defenseData.reduceBlood = 0;
        }

        // 更新状态
        // 攻方

        // 守方
    }

    // 判定是否反击
    var counterAttack = defense.counterAttack * 100;
    random = utils.random(1, 10000);
    if(random >= 1 && random <= counterAttack) {// 反击
        var damage = defense.attack * 25 / 100;
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

    // 守方
    // 增加怒气
    if(attackData.action == 1) {// each hit received
        if(defense.type == EntityType.MONSTER) {
            defense.anger += defense.restoreAngerSpeed.ehr;
        } else {
            defense.anger += defense.restoreAngerSpeed.ehr;
        }
    } else if(attackData.action == 2) {// each skill hit received
        if(defense.type == EntityType.MONSTER) {
            defense.anger += defense.restoreAngerSpeed.eshr;
        } else {
            defense.anger += defense.restoreAngerSpeed.eshr;
        }
    }

    defense.hp -= defenseData.reduceBlood;
    if(defense.hp <= 0) {
        defense.hp = 0;
        defense.died = defenseData.died = true;
        defense.costTime = 10000;
    }

    attackData.hp = attack.hp;
    attackData.anger = attack.anger;
    defenseData.hp = defense.hp;
    defenseData.anger = defense.anger;

    // 写入数据
    // 攻方
    data.attackData = attackData;
    // 守方
    data.defenseData = defenseData;

    battleData.push(data);

    attack.attackers.push({
        currentTime: attack.costTime,
        monsterIndex: monsterIndex
    });
    this.round++;

    if(players[index + 1].costTime == players[index].costTime) {
        return this.attack(battleData, players, index + 1);
    } else {
        return false;
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
    return {
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
}

Fight.createMonster = function(opts) {
    var monsters = dataApi.monster.data;
    var monster = monsters[opts.id];
    return {
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
}

Fight.createTestCharacter = function(opts) {
    var heros = dataApi.heros.data;
    var hero = heros[opts.id];
    return {
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
}

Fight.createTestMonster = function(opts) {
    var monsters = dataApi.monster.data;
    var monster = monsters[opts.id];
    return {
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
}

module.exports = Fight;