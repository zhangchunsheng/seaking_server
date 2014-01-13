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

areaUtil.getOneMoreLevelEntities = function(orderEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == (level + 1)) {
            orderEntities.push(entities[i]);
        }
    }
}

areaUtil.getTheSameLevelEntities = function(orderEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == level) {
            orderEntities.push(entities[i]);
        }
    }
}

areaUtil.getOneLessLevelEntities = function(orderEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == (level - 1)) {
            orderEntities.push(entities[i]);
        }
    }
}

areaUtil.getMoreLevelEntities = function(orderEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level > (level + 1)) {
            orderEntities.push(entities[i]);
        }
    }
}

areaUtil.getLessLevelEntities = function(orderEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level < (level - 1)) {
            orderEntities.push(entities[i]);
        }
    }
}

areaUtil.getCurrentEntities = function(pageInfo, entities, player) {
    var currentPage = pageInfo.currentPage || 1;
    var perPage = pageInfo.perPage || 20;
    var allPage = Math.ceil(entities.length / perPage);
    pageInfo.allPage = allPage;
    if(currentPage < 1) {
        currentPage = 1;
    }
    if(currentPage > allPage) {
        currentPage = allPage;
    }

    var start = 0;
    var end = perPage - 1;
    start = (currentPage - 1) * perPage;
    end = currentPage * perPage;
    if(end > entities.length) {
        end = entities.length;
    }
    var currentEntities = [];
    for(var i = start ; i < end ; i++) {
        currentEntities.push(entities[i]);
    }
    return {
        pageInfo: pageInfo,
        currentEntities: currentEntities
    };
}

areaUtil.getOneMoreLevelTwentyEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == (level + 1)) {
            if(twentyEntities.length < 20)
                twentyEntities.push(entities[i]);
            else
                break;
        }
    }
}

areaUtil.getTheSameLevelTwentyEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == level) {
            if(twentyEntities.length < 20)
                twentyEntities.push(entities[i]);
            else
                break;
        }
    }
}

areaUtil.getOneLessLevelTwentyEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level == (level - 1)) {
            if(twentyEntities.length < 20)
                twentyEntities.push(entities[i]);
            else
                break;
        }
    }
}

areaUtil.getMoreLevelTwentyEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level > (level + 1)) {
            if(twentyEntities.length < 20)
                twentyEntities.push(entities[i]);
            else
                break;
        }
    }
}

areaUtil.getLessLevelTwentyEntities = function(twentyEntities, entities, level) {
    for(var i = 0 ; i < entities.length ; i++) {
        if(entities[i].level < (level - 1)) {
            if(twentyEntities.length < 20)
                twentyEntities.push(entities[i]);
            else
                break;
        }
    }
}