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
    this.currentSkill = opts.currentSkill || {};
    this.activeSkills = opts.activeSkills || [];
    this.passiveSkills = opts.passiveSkills || [];
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

/**
 * 初始化技能
 * @param cId
 */
Skills.prototype.initSkills = function(cId) {
    var skills = heroSkills[cId];
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
    console.log(this);
}