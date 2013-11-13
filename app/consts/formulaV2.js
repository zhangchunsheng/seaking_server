/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-13
 * Description: formulaV2
 */
var formula = module.exports;
var dataApi = require('../utils/dataApi');

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