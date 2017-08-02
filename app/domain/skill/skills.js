/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-25
 * Description: skills
 */
var util = require('util');
var Entity = require('./../entity/entity');
var heroSkills = require('../../../config/data/heroSkills');
var Persistent = require('./../persistent');
var consts = require('../../consts/consts');
var dataApi = require('../../utils/dataApi');

var Skills = function(opts) {
    if(typeof opts == "undefined")
        opts = {};
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;
    this.currentSkill = opts.currentSkill || {};
    this.activeSkills = opts.activeSkills || [];
    this.passiveSkills = opts.passiveSkills || [];

    this.currentSkills = opts.currentSkills || {};
    this.currentSkillsEntity = opts.currentSkillsEntity || {};
    this.allSkills = opts.allSkills = [];
};

module.exports = Skills;

util.inherits(Skills, Persistent);

/**
 * getInfo
 */
Skills.prototype.getInfo = function() {

}

/**
 * strip
 */
Skills.prototype.strip = function() {

}

/**
 *
 * @param skillId
 * @param type
 */
Skills.prototype.addSkills = function(skillId, type) {

}

/**
 * 设置技能
 * @param opts
 */
Skills.prototype.setSkills = function(opts) {
    this.currentSkill = opts.currentSkill || {};
    this.activeSkills = opts.activeSkills || [];
    this.passiveSkills = opts.passiveSkills || [];
}

Skills.prototype.setSkillsV2 = function(opts) {
    this.currentSkills = opts.currentSkills || {};
    this.allSkills = opts.allSkills || [];
}

/**
 * 初始化技能
 * @param cId
 */
Skills.prototype.initSkills = function(cId) {
    if(cId) {
        var skills = heroSkills[cId];
    } else {
        var skills = heroSkills[this.cId];
    }

    this.currentSkill = {};
    for(var i = 0 ; i < skills.length ; i++) {
        if(skills[i].type == consts.skillType.ACTIVE_SKILL) {
            if(dataApi.skillList.findById(skills[i].skillId).requirement == "") {
                this.activeSkills.push({//{skillId:"",status:0,selected:1}
                    skillId: skills[i].skillId,
                    status: 1,
                    select: 1
                });
                var date = new Date();
                this.currentSkill = {
                    skillId: skills[i].skillId,
                    time: date.getTime()
                };
            } else {
                this.activeSkills.push({//{skillId:"",status:0,selected:1}
                    skillId: skills[i].skillId,
                    status: 0
                });
            }
        } else if(skills[i].type == consts.skillType.PASSIVE_SKILL) {
            this.passiveSkills.push({
                skillId: skills[i].skillId,
                status: 0
            });
        }
    }
}
/**
 * 初始化技能
 * @param cId
 */
Skills.prototype.initSkillsV2 = function(cId) {
    this.initCurrentSkills(cId);
    this.initAllSkills(cId);
}

/**
 * 初始化当前技能
 * @param cId
 */
Skills.prototype.initCurrentSkills = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";
    this.currentSkills = {};
    this.currentSkills[1] = {
        skillId: "SK101101",
        level: 1
    };
    this.currentSkills[2] = {
        skillId: 0,
        level: 0
    };
    this.currentSkills[3] = {
        skillId: 0,
        level: 0
    };
    this.currentSkills[4] = {
        skillId: 0,
        level: 0
    };
    this.currentSkills[5] = {
        skillId: 0,
        level: 0
    };
    this.currentSkills[6] = {
        skillId: 0,
        level: 0
    };
    var data = this.currentSkills
    if(dataType == "string") {
        data = JSON.stringify(data);
    }
    return data;
}

/**
 * 初始化所有技能
 * @param cId
 */
Skills.prototype.initAllSkills = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";
    this.allSkills = [];
    var skills = dataApi.skillsV2.all();
    for(var i in skills) {
        this.allSkills.push({
            skillId: skills[i].id,
            level: 1
        });
    }
    var data = {
        allSkills: this.allSkills
    }
    if(dataType == "string") {
        data = JSON.stringify(data);
    }
    return data;
}