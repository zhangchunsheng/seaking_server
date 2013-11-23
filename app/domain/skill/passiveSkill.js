/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: fightskill
 */

var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('./../buff');
var Skill = require('./skill');

/**
 *
 * @param opts
 * @constructor
 */
var PassiveSkill = function(opts) {
    Skill.call(this, opts);
};

util.inherits(PassiveSkill, Skill);

module.exports = PassiveSkill;

PassiveSkill.prototype.attack = function() {

}

PassiveSkill.create = function(skill) {

}
