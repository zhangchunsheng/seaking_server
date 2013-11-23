/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-25
 * Description: initSkill
 */
var should = require('should');
var Skills = require('../../app/domain/skill/skills');
var redis = require('../../app/dao/redis/redis');
var userService = require('../../app/services/userService');

redis.init();

function testSkills() {
    var skills = new Skills();
    skills.initSkills(1);

    var currentSkill = skills.currentSkill || {};
    var activeSkills = skills.activeSkills || [];
    var passiveSkills = skills.passiveSkills || [];

    var array = [];
    var key = "S1_T1_wozlla_C10";
    array.push(["hset", key, "currentSkill", JSON.stringify(currentSkill)]);
    array.push(["hset", key, "activeSkills", JSON.stringify(activeSkills)]);
    array.push(["hset", key, "passiveSkills", JSON.stringify(passiveSkills)]);

    key = "S1_T1_html5_C7420";
    array.push(["hset", key, "currentSkill", JSON.stringify(currentSkill)]);
    array.push(["hset", key, "activeSkills", JSON.stringify(activeSkills)]);
    array.push(["hset", key, "passiveSkills", JSON.stringify(passiveSkills)]);
    userService.update(array, function(err, reply) {
        if (process.getgid) {
            console.log('Current gid: ' + process.getgid());
        }
        process.exit(0)
    });
}

testSkills();