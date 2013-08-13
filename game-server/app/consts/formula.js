/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: formula
 */
var formula = module.exports;
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../util/dataApi');

formula.calDamage = function(attacker, target) {

}

/**
 * format time
 * @param date
 * @returns {string}
 */
formula.timeFormat = function(date) {
    var n = date.getFullYear();
    var y = date.getMonth() + 1;
    var r = date.getDate();
    var mytime = date.toLocaleTimeString();
    var mytimes = n + "-" + y + "-" + r + " " + mytime;
    return mytimes;
}

/**
 * get timestamp
 * @param date
 * @returns {*}
 */
formula.timestamp = function(date) {
    var time = date.getTime();
    return time;
}

formula.calculateAddUp = function(value, rate, level) {
    var number = value;
    /*for(var i = 0 ; i < level ; i++) {
     number += rate * (i + 1);
     }*/
    number += level * (rate + rate * level) / 2;
    return Math.floor(number);
}

formula.calculateValue = function(value, rate, level) {
    var number = value + rate * level;
    return number;
}

formula.calculateXpNeeded = function(value, rate, level) {
    var xpNeeded = value - rate;
    /*for(var i = 0 ; i < level ; i++) {
     xpNeeded += rate * (i + 1);
     }*/
    xpNeeded += level * (rate + rate * level) / 2;
    return Math.floor(xpNeeded);
}

formula.calculateAccumulated_xp = function(value, rate, level) {
    var xpNeeded = value - rate;
    var accumulated_xp = 0;
    for(var i = 0 ; i < level ; i++) {
        xpNeeded += rate * (i + 1);
        accumulated_xp += xpNeeded;
    }

    return Math.floor(accumulated_xp);
}

formula.calculateHp = function(value, rate, level) {
    rate = rate / 100;
    return this.calculateAddUp(value, rate, level);
}

formula.calculateAttack = function(value, rate, level) {
    rate = rate / 100;
    return this.calculateAddUp(value, rate, level);
}

formula.calculateDefense = function(value, rate, level) {
    rate = rate / 100;
    return this.calculateAddUp(value, rate, level);
}

formula.calculateFocus = function(value, rate, level) {
    rate = rate / 40;
    return this.calculateValue(value, rate, level);
}

formula.calculateSpeedLevel = function(value, rate, level) {
    rate = rate / 40;
    return Math.floor(this.calculateValue(value, rate, level));
}

formula.calculateSpeed = function(value, rate, level) {
    var number = this.calculateSpeedLevel(value, rate, level);
    return 100 / number;
}

formula.calculateDodge = function(value, rate, level) {
    rate = rate / 40;
    return this.calculateValue(value, rate, level);
}

formula.calculateCriticalHit = function(value, rate, level) {
    rate = rate / 40;
    return this.calculateValue(value, rate, level);
}

formula.calculateCritDamage = function(value, rate, level) {
    rate = rate / 40;
    return this.calculateValue(value, rate, level);
}

formula.calculateBlock = function(value, rate, level) {
    rate = rate / 40;
    return this.calculateValue(value, rate, level);
}

formula.calculateCounter = function(value, rate, level) {
    rate = rate / 40;
    return this.calculateValue(value, rate, level);
}

formula.distance = function(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 计算人物属性
 * @param player
 */
formula.calculatePlayerAttribute = function(player) {
    var attack = 0;
    var defense = 0;
    var speedLevel = 0;
    var hp = 0;
    var focus = 0;
    var criticalHit = 0;
    var critDamage = 0;
    var dodge = 0;
    var block = 0;
    var counter = 0;
    var counterDamage = 0;
    var equipments;
    var equipment;
    //集中值 武器百分比 技能百分比 buff百分比
    //武器攻击力 技能攻击力 道具攻击力 buff攻击力
    attack = player.attack + player.attack * player.focus;
    defense = player.defense;
    speedLevel = player.speedLevel;
    hp = player.hp;
    focus = player.focus;
    criticalHit = player.criticalHit;
    critDamage = player.critDamage;
    dodge = player.dodge;
    block = player.block;
    counter = player.counter;
    counterDamage = player.counterDamage;

    equipments = player.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            if(equipment.attackPercentage != 0)
                attack += player.attack * equipment.attackPercentage;
            if(equipment.defensePercentage != 0)
                defense += player.defense * equipment.defensePercentage;
            if(equipment.speedLevelPercentage != 0)
                speedLevel += player.speedLevel * equipment.speedLevelPercentage;
            if(equipment.hpPercentage != 0)
                hp += player.hp * equipment.hpPercentage;

            attack += equipment.attack;
            defense += equipment.defense;
            speedLevel += equipment.speedLevel;
            hp += equipment.hp;
            focus += equipment.focus;
            criticalHit += equipment.criticalHit;
            critDamage += equipment.critDamage;
            dodge += equipment.dodge;
            block += equipment.block;
            counter += equipment.counter;
            counterDamage += equipment.counterDamage;
        }
    }
    player.attack = Math.floor(attack);
    player.defense = Math.floor(defense);
    player.speedLevel = Math.floor(speedLevel);
    player.hp = hp;
    player.maxHp = hp;
    player.focus = focus;
    player.criticalHit = criticalHit;
    player.critDamage = critDamage;
    player.dodge = dodge;
    player.block = block;
    player.counter = counter;
}

/**
 * 计算攻击力
 * @param player
 */
formula.calculatePlayerAttack = function(player) {
    var attack = 0;
    var equipments;
    var equipment;
    //集中值 武器百分比 技能百分比 buff百分比
    //武器攻击力 技能攻击力 道具攻击力 buff攻击力
    attack = player.attack + player.attack * player.focus;
    equipments = player.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            if(equipment.attackPercentage != 0)
                attack += player.attack * equipment.attackPercentage;
            attack += equipment.attack;
        }
    }
    player.attack = Math.floor(attack);
}

/**
 * 计算防御
 * @param player
 */
formula.calculatePlayerDefense = function(player) {
    var defense = 0;
    var equipments;
    var equipment;
    defense = player.defense + player.defense * player.focus;
    equipments = player.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            if(equipment.defensePercentage != 0)
                defense += player.defense * equipment.defensePercentage;
            defense += equipment.defense;
        }
    }
    player.defense = Math.floor(defense);
}