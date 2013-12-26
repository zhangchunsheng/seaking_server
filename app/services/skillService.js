/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var redisService = require('./redisService');
var skillDao = require('../dao/skillDao');
var Skills = require('../domain/skill/skills');
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

skillService.initAllSkills = function(array, serverId, registerType, loginName, playerId, cb) {
    var characterId = utils.getRealCharacterId(playerId);
    var key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);

    var field = "allSkills";
    var allSkills = [];
    var skills = dataApi.skillsV2.all();
    for(var i in skills) {
        allSkills.push({
            skillId: skills[i].id,
            level: 1
        });
    }
    var value = JSON.stringify({
        allSkills: allSkills
    });
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, allSkills);
    });
}

skillService.getNextSkill = function(skill) {

}

skillService.createNewSkills = function(skillInfo, serverId, registerType, loginName, characterId, character) {
    skillInfo.serverId = serverId;
    skillInfo.registerType = registerType;
    skillInfo.loginName = loginName;
    skillInfo.characterId = characterId;
    skillInfo.allSkills = character.allSkills;
    var skills = new Skills(skillInfo);
    return skills;
}