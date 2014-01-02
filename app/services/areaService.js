/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-24
 * Description: areaService
 */
var redisService = require('./redisService');
var initData = require('../../config/data/initData');
var areaDao = require('../dao/areaDao');
var utils = require('../utils/utils');
var areaUtil = require('../utils/areaUtil');
var dataApi = require('../utils/dataApi');
var formulaV2 = require('../consts/formulaV2');

var areaService = module.exports;

areaService.getAreaInfo = function(player, cb) {
    if(typeof player == "string") {
        areaDao.getAreaInfo({
            currentScene: player
        }, cb);
    } else {
        areaDao.getAreaInfo(player, cb);
    }
}

areaService.getAreaPlayers = function(sceneId, cb) {
    areaDao.getAreaPlayers(sceneId, cb);
}

areaService.addEntity = function(player, cb) {
    areaDao.addEntity(player, cb);
}

areaService.removePlayer = function(player, cb) {
    areaDao.removePlayer(player, cb);
}

areaService.removeAndUpdatePlayer = function(areaId, player, cb) {
    areaDao.removeAndUpdatePlayer(areaId, player, cb);
}

/**
 * getEntities
 * @param sceneId
 * @param results
 * @param player
 * @param cb
 */
areaService.getEntities = function(sceneId, results, player, cb) {
    var entities = [];
    var entity = {};
    var result;
    var count = 0;
    for(var i in results) {
        count++;
    }
    if(count < 20) {
        areaService.setEntities(sceneId, function(err, entities) {
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
            entities = areaService.getTwentyEntities(entities, player);
            utils.invokeCallback(cb, null, entities);
        });
    } else {
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
        entities = areaService.getTwentyEntities(entities, player);
        utils.invokeCallback(cb, null, entities);
    }
}

/**
 * getTwentyEntities
 * level+1 level level-1 >level <level type:1 2 3 4 5
 * @param entities
 * @returns {Array}
 */
areaService.getTwentyEntities = function(entities, player) {
    var twentyEntities = [];
    var level = parseInt(player.level);
    areaUtil.getOneMoreLevelEntities(twentyEntities, entities, level);
    if(twentyEntities.length < 20) {
        areaUtil.getTheSameLevelEntities(twentyEntities, entities, level);
    }
    if(twentyEntities.length < 20) {
        areaUtil.getOneLessLevelEntities(twentyEntities, entities, level);
    }
    if(twentyEntities.length < 20) {
        areaUtil.getMoreLevelEntities(twentyEntities, entities, level);
    }
    if(twentyEntities.length < 20) {
        areaUtil.getLessLevelEntities(twentyEntities, entities, level);
    }
    return twentyEntities;
}

/**
 *
 * @param sceneId
 */
areaService.setEntities = function(sceneId, cb) {
    var keys = initData["scene"][sceneId];
    var array = [];
    var random = 0;
    var cIds = ["H1101","H1102","H1103","H1104","H1107","H1201","H1202","H1203","H1205","H1206","H1209"];
    var cId = "H1101";
    var level = 1;
    for(var i = 0 ; i < keys.length ; i++) {
        array.push(["hmget", keys[i], "id", "nickname", "cId", "level"]);
    }
    areaService.getPlayers(array, function(err, results) {
        array = [];
        var entities = [];
        var entity = {};
        var date = new Date();
        var time = date.getTime();
        for(var i = 0 ; i < results.length ; i++) {
            cId = cIds[utils.random(0, cIds.length - 1)];
            level = utils.random(1, 10);
            entity = {
                name: results[i].nickname,
                cId: cId,
                level: level,
                time: time
            }
            array.push(["hset", sceneId, results[i][0], JSON.stringify(entity)]);

            array.push(["hset", keys[i], "cId", cId]);
            array.push(["hset", keys[i], "level", level]);
            array.push(["hset", keys[i], "currentScene", sceneId]);
            areaService.setAttribute(array, keys[i], entity);
            entities.push({
                id: results[i][0],
                name: results[i][1],
                cId: cId,
                level: level
            });
        }

        redisService.setData(array, function(err, results) {
            utils.invokeCallback(cb, null, entities);
        });
    });
}

areaService.setAttribute = function(array, key, entity) {
    var hero = dataApi.herosV2.findById(entity.cId);
    var level = entity.level;
    var attributes = {
        hp: formulaV2.calculateHp(hero.hp, hero.addHp, level),
        maxHp: formulaV2.calculateHp(hero.hp, hero.addHp, level),
        attack: formulaV2.calculateAttack(hero.attack, hero.addAttack, level),
        defense: formulaV2.calculateDefense(hero.defense, level),
        focus: formulaV2.calculateSunderArmor(hero.sunderArmor, level),
        sunderArmor: formulaV2.calculateSunderArmor(hero.sunderArmor, level),
        speedLevel: formulaV2.calculateSpeedLevel(hero.speed, level),
        speed: formulaV2.calculateSpeed(hero.speed, level),
        dodge: formulaV2.calculateDodge(hero.dodge, level),
        criticalHit: formulaV2.calculateCriticalHit(hero.criticalHit, level),
        critDamage: formulaV2.calculateCritDamage(hero.attack, level),
        block: formulaV2.calculateBlock(hero.block, level),
        counter: formulaV2.calculateCounter(hero.counter, level)
    }

    for(var i in attributes) {
        array.push(["hset", key, i, attributes[i]]);
    }
}

/**
 *
 * @param sceneId
 */
areaService.getPlayers = function(array, cb) {
    redisService.getData(array, cb);
}