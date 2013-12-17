/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-09
 * Description: partnerUtil
 */
var dataApi = require('./dataApi');
var Player = require('../domain/entity/player');
var utils = require("./utils");
var buffUtil = require("./buffUtil");
var formula = require('../consts/formula');
var formulaV2 = require('../consts/formulaV2');

var partnerUtil = module.exports;

partnerUtil.getPartner = function(playerId, player) {
    var partners = player.partners;
    for(var i = 0 ; i < partners.length ; i++) {
        if(partners[i].id == playerId) {
            return partners[i];
        }
    }
    return null;
}

partnerUtil.initPartner = function(opts) {
    var hero = dataApi.heros.findById(opts.cId);
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.userId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: hero.name,
        buffs: buffUtil.getInitBuff(),
        experience: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        level: opts.level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, opts.level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        photo: '',
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        anger: 0,
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), opts.level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), opts.level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), opts.level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), opts.level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), opts.level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), opts.level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), opts.level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), opts.level),
        equipments: partnerUtil.initEquipments(),
        skills: {
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        },
        ghost: partnerUtil.initGhost(),
        aptitude: partnerUtil.initAptitude(opts.cId)
    };
    return character;
}

partnerUtil.initGhost = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var data = {"level":0};

    if(dataType = "string") {
        data = JSON.stringify(data);
    }
    return data;
}

partnerUtil.initAptitude = function(cId, dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";
    else
        dataType = "string";

    var heroId = utils.getCategoryHeroId(cId);
    var aptitudes = dataApi.aptitudes.findById(heroId).aptitudes;

    var data = {};
    for(var i in aptitudes) {
        data[aptitudes[i]] = {"level":0,"count":50};
    }
    data.count = 250;
    data.upgradeDate = 1;
    data.upgradeTimeOneDay = 0;

    if(dataType == "string") {
        data = JSON.stringify(data);
    }
    return data;
}

partnerUtil.initEquipments = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var data = {
        weapon: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//武器

        necklace: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//项链
        helmet: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//头盔
        armor: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//护甲
        belt: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//腰带
        legguard: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//护腿
        amulet: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//护符
        shoes: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        },//鞋
        ring: {
            epid: 0,
            level: 0,
            forgeLevel: 0
        }//戒指
    };

    if(dataType = "string") {
        data = JSON.stringify(data);
    }
    return data;
}

partnerUtil.initPartnerV2 = function(opts) {
    var hero = dataApi.heros.findById(opts.cId);
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.userId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: hero.name,
        buffs: buffUtil.getInitBuff(),
        experience: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        level: opts.level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, opts.level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        photo: '',
        hp: formulaV2.calculateHp(hero.hp, hero.addHp, opts.level),
        maxHp: formulaV2.calculateHp(hero.hp, hero.addHp, opts.level),
        anger: 0,
        attack: formulaV2.calculateAttack(hero.attack, hero.addAttack, opts.level),
        defense: formulaV2.calculateDefense(hero.defense, opts.level),
        focus: formulaV2.calculateSunderArmor(hero.sunderArmor, opts.level),
        sunderArmor: formulaV2.calculateSunderArmor(hero.sunderArmor, opts.level),
        speedLevel: formulaV2.calculateSpeedLevel(hero.speed, opts.level),
        speed: formulaV2.calculateSpeed(hero.speed, opts.level),
        dodge: formulaV2.calculateDodge(hero.dodge, opts.level),
        criticalHit: formulaV2.calculateCriticalHit(hero.criticalHit, opts.level),
        critDamage: formulaV2.calculateCritDamage(hero.attack, opts.level),
        block: formulaV2.calculateBlock(hero.block, opts.level),
        counter: formulaV2.calculateCounter(hero.counter, opts.level),
        equipments: partnerUtil.initEquipments(),
        skills: {
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        },
        ghost: partnerUtil.initGhost(),
        aptitude: partnerUtil.initAptitude(opts.cId)
    };
    return character;
}

partnerUtil.getPlayer = function(opts) {
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.replies.userId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.replies.nickname,
        experience: parseInt(opts.replies.experience),
        level: opts.level,
        needExp: parseInt(opts.replies.needExp),
        accumulated_xp: parseInt(opts.replies.accumulated_xp),
        photo: opts.replies.photo,
        hp: parseInt(opts.replies.hp),
        maxHp: parseInt(opts.replies.maxHp),
        anger: parseInt(opts.replies.anger),
        attack: parseInt(opts.replies.attack),
        defense: parseInt(opts.replies.defense),
        focus: parseFloat(opts.replies.focus),
        speedLevel: parseInt(opts.replies.speedLevel),
        speed: parseFloat(opts.replies.speed),
        dodge: parseFloat(opts.replies.dodge),
        criticalHit: parseFloat(opts.replies.criticalHit),
        critDamage: parseFloat(opts.replies.critDamage),
        block: parseFloat(opts.replies.block),
        counter: parseFloat(opts.replies.counter),
        equipments: JSON.parse(opts.replies.equipments),
        skills: {
            currentSkill: opts.replies.currentSkill ? JSON.parse(opts.replies.currentSkill) : {},
            activeSkills: JSON.parse(opts.replies.activeSkills),
            passiveSkills: JSON.parse(opts.replies.passiveSkills)
        },
        buffs: opts.replies.buffs ? JSON.parse(opts.replies.buffs).buffs : buffUtil.getInitBuff(),
        ghost: JSON.parse(opts.replies.ghost || partnerUtil.initGhost("string")),
        aptitude: JSON.parse(opts.replies.aptitude || partnerUtil.initAptitude(opts.cId, "string"))
    };
    return character;
}

partnerUtil.getPlayerV2 = function(opts) {

}