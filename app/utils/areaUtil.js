/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-01-02
 * Description: buffUtil
 */
var consts = require('../consts/consts');
var redisService = require('../services/redisService');

var areaUtil = module.exports;

areaUtil.getEntities = function(sceneId, results, player) {
    var entities = [];
    var entity = {};
    var result;
    for(var i in results) {
        if(i == player.id)
            continue;
        result = JSON.parse(results[i]);
        entity = {
            id: i,
            nickname: result.name,
            heroId: result.cId,
            level: result.level
        };
        entities.push(entity);
    }
    return entities;
}

areaUtil.getOneMoreLevelEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == (level + 1)) {
            twentyEntities.push(entities[i]);
        }
    }
}

areaUtil.getTheSameLevelEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == level) {
            twentyEntities.push(entities[i]);
        }
    }
}

areaUtil.getOneLessLevelEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == (level - 1)) {
            twentyEntities.push(entities[i]);
        }
    }
}

areaUtil.getMoreLevelEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level > (level + 1)) {
            twentyEntities.push(entities[i]);
        }
    }
}

areaUtil.getLessLevelEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level < (level - 1)) {
            twentyEntities.push(entities[i]);
        }
    }
}