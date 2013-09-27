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
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var Skills = require('../domain/skills');

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
    var hero = dataApi.heros.findById(cId);
    var character = {
        id: "S" + serverId + "C" + characterId + "P" + partnerId,
        kindId: cId,
        cId: cId,
        userId: replies.userId,
        registerType: registerType,
        loginName: loginName,
        nickname: replies.nickname,
        experience: parseInt(replies.experience),
        level: level,
        needExp: parseInt(replies.needExp),
        accumulated_xp: parseInt(replies.accumulated_xp),
        photo: replies.photo,
        hp: parseInt(replies.hp),
        maxHp: parseInt(replies.maxHp),
        anger: parseInt(replies.anger),
        attack: parseInt(replies.attack),
        defense: parseInt(replies.defense),
        focus: parseFloat(replies.focus),
        speedLevel: parseInt(replies.speedLevel),
        speed: parseFloat(replies.speed),
        dodge: parseFloat(replies.dodge),
        criticalHit: parseFloat(replies.criticalHit),
        critDamage: parseFloat(replies.critDamage),
        block: parseFloat(replies.block),
        counter: parseFloat(replies.counter),
        equipments: JSON.parse(replies.equipments),
        skills: {
            currentSkill: replies.currentSkill ? JSON.parse(replies.currentSkill) : {},
            activeSkills: JSON.parse(replies.activeSkills),
            passiveSkills: JSON.parse(replies.passiveSkills)
        },
        buffs: replies.buffs ? JSON.parse(replies.buffs).buffs : []
    };
    character.equipmentsEntity = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId + "P" + partnerId);
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
            var flag = false;
            for(var i = 0 ; i < partners.length ; i++) {
                if(partners[i].cId == cId) {
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                partnerDao.getPartnerId(client, function(err, partnerId) {
                    var hero = dataApi.heros.findById(cId);
                    var partner = dataApi.partners.findById(cId);
                    var level = partner.level;
                    var skills = new Skills();
                    skills.initSkills(cId);
                    var character = {
                        id: "S" + serverId + "C" + characterId + "P" + partnerId,
                        kindId: cId,
                        cId: cId,
                        userId: userId,
                        registerType: registerType,
                        loginName: loginName,
                        nickname: hero.name,
                        buffs: [],
                        experience: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
                        level: level,
                        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, level + 1),
                        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
                        photo: '',
                        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
                        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
                        anger: 0,
                        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), level),
                        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), level),
                        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), level),
                        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
                        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
                        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), level),
                        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), level),
                        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), level),
                        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), level),
                        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), level),
                        equipments: {
                            weapon: {
                                epid: 0,
                                level: 0
                            },//武器

                            necklace: {
                                epid: 0,
                                level: 0
                            },//项链
                            helmet: {
                                epid: 0,
                                level: 0
                            },//头盔
                            armor: {
                                epid: 0,
                                level: 0
                            },//护甲
                            belt: {
                                epid: 0,
                                level: 0
                            },//腰带
                            legguard: {
                                epid: 0,
                                level: 0
                            },//护腿
                            amulet: {
                                epid: 0,
                                level: 0
                            },//护符
                            shoes: {
                                epid: 0,
                                level: 0
                            },//鞋
                            ring: {
                                epid: 0,
                                level: 0
                            }//戒指
                        },
                        skills: {
                            currentSkill: skills.currentSkill,
                            activeSkills: skills.activeSkills,
                            passiveSkills: skills.passiveSkills
                        }
                    };

                    partners.push({
                        playerId: character.id,
                        cId: character.cId
                    });
                    var obj = {
                        partners: partners
                    };
                    client.hset(key, "partners", JSON.stringify(obj));

                    key = dbUtil.getPartnerKey(serverId, registerType, loginName, characterId, partnerId);

                    var array = dbUtil.getMultiCommand(key, character);
                    client.multi(array).exec(function(err, replies) {
                        character.equipmentsEntity = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId + "P" + partnerId);
                        var Partner = require('../domain/entity/partner');
                        var partner = new Partner(character);
                        redis.release(client);
                        utils.invokeCallback(cb, null, partner);
                    });
                });
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