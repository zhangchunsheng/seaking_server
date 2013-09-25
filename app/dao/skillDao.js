/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: fightskillDao
 */
var fightskill = require('../domain/fightskill');
var utils = require('../utils/utils');

var fightskillDao = module.exports;

/**
 * Add a new fight skill
 *
 * @param {Number} characterId
 * @param {function} cb
 */
fightskillDao.add = function(skill, cb) {

};

/**
 * Update fight skill
 * @param val {Object} Update params, contains level and skill id
 */
fightskillDao.update = function(val, cb) {

};

fightskillDao.updateSkill = function(skills, type, cb) {

};

/**
 * Find fightskills by characterId
 *
 * @param {Number} characterId
 * @param {function} cb
 */
fightskillDao.getFightSkillsByCharacterId = function(characterId, cb) {
    
};
