/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-24
 * Description: partnerDao
 */
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var skillDao = require('./skillDao');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var buffUtil = require('../utils/buffUtil');
var playerUtil = require('../utils/playerUtil');
var partnerUtil = require('../utils/partnerUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var Skills = require('../domain/skill/skills');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var partnerDao = module.exports;

/**
 * 获得所有partner
 * @param client
 * @param cb
 */
partnerDao.getAllPartner = function(client, partners, serverId, registerType, loginName, characterId, cb) {
    var array = [];
    var key = "";
    var partnerId = "";
    for(var i = 0 ; i < partners.length ; i++) {
        partnerId = partnerDao.getRealPartnerId(partners[i].playerId);
        key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);
        array.push(["hgetall", key]);
    }
    if(array.length == 0) {
        utils.invokeCallback(cb, null, []);
    } else {
        client.multi(array).exec(function(err, replies) {
            var partners = getMultiPartner(serverId, registerType, loginName, characterId, replies);
            utils.invokeCallback(cb, null, partners);
        });
    }
}

partnerDao.getRealPartnerId = function(partnerId) {
    partnerId = partnerId.substr(partnerId.indexOf("P") + 1);
    return partnerId;
}

/**
 * 获得partner
 */
partnerDao.getPartner = function(serverId, registerType, loginName, characterId, partnerId, cb) {
    if(partnerId.indexOf("P") >= 0) {
        partnerId = partnerDao.getRealPartnerId(partnerId);
    }

    dbUtil.selectDb(redisConfig.database.SEAKING_REDIS_DB, function(client) {
        _getPartner(client, serverId, registerType, loginName, characterId, partnerId, cb);
    });
};

function _getPartner(client, serverId, registerType, loginName, characterId, partnerId, cb) {
    var key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);
    client.hgetall(key, function(err, replies) {
        console.log(replies);
        var partner = generalPartner(serverId, registerType, loginName, characterId, partnerId, replies);

        redis.release(client);
        utils.invokeCallback(cb, null, partner);
    });
};

function getMultiPartner(serverId, registerType, loginName, characterId, partners) {
    var partnerId = "";
    var _partners = [];
    for(var i = 0 ; i < partners.length ; i++) {
        partnerId = partnerDao.getRealPartnerId(partners[i].id);
        _partners.push(generalPartner(serverId, registerType, loginName, characterId, partnerId, partners[i]));
    }
    return _partners;
}

function generalPartner(serverId, registerType, loginName, characterId, partnerId, replies) {
    var cId = replies.cId;
    var level = parseInt(replies.level);
    var character = partnerUtil.getPlayer({
        serverId: serverId,
        registerType: registerType,
        loginName: loginName,
        characterId: characterId,
        partnerId: partnerId,
        cId: cId,
        level: level,
        replies: replies
    });
    //character.equipmentsEntity = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId + "P" + partnerId);
    playerUtil.createPKEntity(character, serverId, registerType, loginName, characterId + "P" + partnerId);
    var Partner = require('../domain/entity/partner');
    var partner = new Partner(character);
    return partner;
}

/**
 * createPartner
 * @param cId
 */
partnerDao.createPartner = function(serverId, userId, registerType, loginName, characterId, cId, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + characterId;// 先判断是否已创建角色
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "partners", function(err, reply) {
            var partners = JSON.parse(reply).partners;
            var allPartners = JSON.parse(reply).allPartners || [];
            var flag = false;
            for(var i = 0 ; i < partners.length ; i++) {
                if(partners[i].cId == cId) {
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                var partnerInfo = null;
                for(var i = 0 ; i < allPartners.length ; i++) {
                    if(allPartners[i].cId == cId) {
                        partnerInfo = allPartners[i];
                        break;
                    }
                }
                if(partnerInfo != null) {
                    partners.push(partnerInfo);
                    var obj = {
                        partners: partners,
                        allPartners: allPartners
                    };
                    client.hset(key, "partners", JSON.stringify(obj), function(err, reply) {
                        var partnerId = partnerDao.getRealPartnerId(partnerInfo.playerId);
                        _getPartner(client, serverId, registerType, loginName, characterId, partnerId, function(err, partner) {
                            redis.release(client);
                            utils.invokeCallback(cb, null, partner);
                        });
                    });
                } else {
                    partnerDao.getPartnerId(client, function(err, partnerId) {
                        var partner = dataApi.partners.findById(cId);
                        var level = partner.level;
                        var skills = new Skills();
                        skills.initSkills(cId);
                        var character = partnerUtil.initPartner({
                            cId: cId,
                            serverId: serverId,
                            characterId: characterId,
                            partnerId: partnerId,
                            userId: userId,
                            registerType: registerType,
                            loginName: loginName,
                            level: level,
                            skills: skills
                        });

                        partners.push({
                            playerId: character.id,
                            cId: character.cId
                        });
                        allPartners.push({
                            playerId: character.id,
                            cId: character.cId
                        });
                        var obj = {
                            partners: partners,
                            allPartners: allPartners
                        };
                        //client.hset(key, "partners", JSON.stringify(obj));
                        var array = [];
                        array.push(["hset", key, "partners", JSON.stringify(obj)]);

                        key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);

                        dbUtil.getMultiCommand(array, key, character);
                        client.multi(array).exec(function(err, replies) {
                            //character.equipmentsEntity = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId + "P" + partnerId);
                            playerUtil.createPKEntity(character, serverId, registerType, loginName, characterId + "P" + partnerId);
                            var Partner = require('../domain/entity/partner');
                            var partner = new Partner(character);
                            redis.release(client);
                            utils.invokeCallback(cb, null, partner);
                        });
                    });
                }
            } else {
                redis.release(client);
                utils.invokeCallback(cb, {
                    errCode: 101
                });
            }
        })
        .exec(function (err, replies) {

        });
    });
}

/**
 * 获得partnerId
 */
partnerDao.getPartnerId = function(client, callback) {
    var key = "partnerId";
    client.incr(key, function(err, reply) {
        callback.call(this, err, reply);
    });
}

/**
 * 获得partnerId
 */
partnerDao.updatePartners = function(client, key, character, partners) {
    partners.push({
        playerId: character.characterId,
        cId: character.cId
    });
    client.hset(key, "partners", JSON.stringify(partners));
}

/**
 * addHP
 */
partnerDao.addHP = function(player, hp, cb) {
    var partners = player.partners;
    for(var i = 0 ; i < partners.length ; i++) {
        if(partners[i].hp < partners[i].maxHp) {
            partners[i].hp += hp;
        }
        if(partners[i].hp > partners[i].maxHp) {
            partners[i].hp = partners[i].maxHp;
        }
    }
    partnerDao.updatePartners(player, "hp", cb);
}

/**
 *
 * @param player
 * @param field
 * @param cb
 */
partnerDao.updatePartners = function (player, field, cb) {
    var serverId = player.regionId;
    var registerType = player.registerType;
    var loginName = player.loginName;

    var array = [];
    var partners = player.partners;
    var key = "";
    var characterId = 0;
    var partnerId = 0;
    var obj = {};

    characterId = utils.getRealCharacterId(player.id);
    for(var i = 0 ; i < partners.length ; i++) {
        partnerId = partnerDao.getRealPartnerId(partners[i].id);
        key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);
        obj[partners[i].id] = {};

        if(Object.prototype.toString.call(field) === '[object Array]') {
            var obj = {};
            for(var j = 0, l = field.length ; j < l ; j++) {
                array.push(["hset", key, field[j], partners[i][field[j]]]);
                obj[partners[i].id][field[j]] = partners[i][field[j]];
            }
        } else {
            array.push(["hset", key, field, partners[i][field]]);
        }
    }

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.multi(array).exec(function (err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, partners);
            });
        }).exec(function (err, replies) {

        });
    });
};