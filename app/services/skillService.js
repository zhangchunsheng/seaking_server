/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var skillDao = require('../dao/skillDao');
var Skills = require('../domain/skills');
var dataApi = require('../utils/dataApi');

var skillService = module.exports;

skillService.initSkill = function(cId) {
    var skills = new Skills();
    skills.initSkills(cId);

    var currentSkill = skills.currentSkill || {};
    var activeSkills = skills.activeSkills || [];
    var passiveSkills = skills.passiveSkills || [];

    return {
        currentSkill: currentSkill,
        activeSkills: activeSkills,
        passiveSkills: passiveSkills
    };
}

skillService.getNextSkill = function(skill) {

}