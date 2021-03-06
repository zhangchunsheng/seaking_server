/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var dataApi = require('../utils/dataApi');
var redisService = require('./redisService');
var messageService = require('./messageService');
var userService = require('./userService');
var formationDao = require('../dao/formationDao');
var Formation = require('../domain/formation');
var consts = require('../consts/consts');

var formationService = module.exports;

/**
 * changeFormation
 * @param array
 * @param player
 * @param formation
 * @param cb
 */
formationService.changeFormation = function(array, player, formation, cb) {
    var new_formation = {};
    for(var i in player.formationEntity.formation.formation) {
        new_formation[i] = {};
        if(formation[i] == null || formation[i] == "") {
            new_formation[i] = null;
        } else {
            new_formation[i].playerId = formation[i];
        }
    }
    player.formationEntity.formation.formation = new_formation;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, player.formationEntity.formation);
    });
}

formationService.resetFormation = function(array, player, formation, cb) {
    player.formationEntity.formation = formation;

    var tacticalId = player.formationEntity.formation.tactical.id;
    var tactical = {};
    var tacticals = player.formationEntity.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].active == 1) {
            delete tacticals[i].active;
        }
    }
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].id == tacticalId) {
            tacticals[i].active = 1;
            tactical = {
                id: tacticals[i].id,
                level: tacticals[i].level
            }
        }
    }
    player.formationEntity.formation.tactical = tactical;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);

    field = "tacticals";
    value = JSON.stringify({
        tacticals: tacticals
    });
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, player.formationEntity.formation);
    });
}

formationService.setDefault = function(array, player, formation, tacticalId, cb) {
    var new_formation = {};
    for(var i in player.formationEntity.formation.formation) {
        new_formation[i] = {};
        if(formation[i] == null || formation[i] == "") {
            new_formation[i] = null;
        } else {
            new_formation[i].playerId = formation[i];
        }
    }
    player.formationEntity.formation.formation = new_formation;

    var tactical = {};
    var tacticals = player.formationEntity.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].active == 1) {
            delete tacticals[i].active;
        }
    }
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].id == tacticalId) {
            tacticals[i].active = 1;
            tactical = {
                id: tacticals[i].id,
                level: tacticals[i].level
            }
        }
    }
    player.formationEntity.formation.tactical = tactical;

    player.formationEntity.lastFormation = player.formationEntity.formation;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);

    field = "lastFormation";
    var lastFormation = player.formationEntity.lastFormation;
    value = JSON.stringify(lastFormation);
    array.push(["hset", key, field, value]);

    field = "tacticals";
    value = JSON.stringify({
        tacticals: tacticals
    });
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, player.formationEntity.formation);
    });
}

/**
 * setTactical
 * @param array
 * @param player
 * @param tacticalId
 * @param cb
 */
formationService.setTactical = function(array, player, tacticalId, cb) {
    var tactical = {};
    var tacticals = player.formationEntity.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].active == 1) {
            delete tacticals[i].active;
        }
    }
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].id == tacticalId) {
            tacticals[i].active = 1;
            tactical = {
                id: tacticals[i].id,
                level: tacticals[i].level
            }
        }
    }
    player.formationEntity.formation.tactical = tactical;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);

    field = "tacticals";
    value = JSON.stringify({
        tacticals: tacticals
    });
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, tacticalId);
    });
}

formationService.upgradeTactical = function(array, player, tacticalId, cb) {
    var tactical = player.formationEntity.formation.tactical;
    var level;
    var tacticals = player.formationEntity.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].id == tacticalId) {
            tacticals[i].level++;
            level = tacticals[i].level;
            if(tacticals[i].active == 1) {
                tactical.level = level;
            }
        }
    }
    player.formationEntity.formation.tactical = tactical;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);

    field = "tacticals";
    value = JSON.stringify({
        tacticals: tacticals
    });
    array.push(["hset", key, field, value]);
    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, level);
    });
}

/**
 * unlock
 * @param array
 * @param player
 * @param formationId
 * @param cb
 */
formationService.unlock = function(array, player, unlockNum, formationId, cb) {
    var formation = player.formationEntity.formation.formation;
    formation[formationId] = null;

    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var formation = player.formationEntity.formation;
    var value = JSON.stringify(formation);
    array.push(["hset", key, field, value]);

    var message = {
        type: consts.pushMessageType.FORMATION_UNLOCK,
        num: unlockNum - 1,
        message: ''
    };
    messageService.updatePushMessage(array, player, key, message);

    if(unlockNum == 0) {
        userService.getUpdateArray(array, player, key, ["gameCurrency"]);
    }

    redisService.setData(array, function(err, reply) {
        utils.invokeCallback(cb, err, message);
    });
}

formationService.createNewFormation = function(formationInfo, serverId, registerType, loginName, characterId, character) {
    formationInfo.serverId = serverId;
    formationInfo.registerType = registerType;
    formationInfo.loginName = loginName;
    formationInfo.characterId = characterId;
    formationInfo.cId = character.cId;
    formationInfo.formation = character.formation;
    formationInfo.lastFormation = character.lastFormation;
    formationInfo.tacticals = character.tacticals;
    var formation = new Formation(formationInfo);
    return formation;
}