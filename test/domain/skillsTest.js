/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-25
 * Description: skillsTest
 */
var should = require('should');
var Skills = require('../../app/domain/skill/skills');
var redis = require('../../app/dao/redis/redis');
var userService = require('../../app/services/userService');

describe('skills test', function() {
    it('should successully', function() {
        var skills = new Skills();
        skills.initSkills(1);
    });

    it('skillId', function() {
        var skillId = "SK01234";

        var type = skillId.substr(4, 1);
        type.should.equal("2");

        var level = skillId.substr(6, 1);
        level.should.equal("4");

        var realSkillId = skillId.substr(0, 6);
        realSkillId.should.equal("SK0123");
    })
});