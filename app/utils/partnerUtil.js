/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-09
 * Description: partnerUtil
 */
var dataApi = require('./dataApi');
var Player = require('../domain/entity/player');
var Skills = require('../domain/skill/skills');
var utils = require("./utils");
var buffUtil = require("./buffUtil");
var equipmentUtil = require("./equipmentUtil");
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

    var partner = dataApi.partners.findById(opts.cId);
    var level = partner.level;
    var skills = new Skills(opts);
    //skills.initSkills(opts.cId);
    skills.initSkillsV2(opts.cId);

    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: hero.name,
        buffs: buffUtil.getInitBuff(),
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
        equipments: partnerUtil.initEquipments(),
        skills: {
            currentSkill: skills.currentSkill,
            activeSkills: skills.activeSkills,
            passiveSkills: skills.passiveSkills
        },
        currentSkills: skills.currentSkills,
        allSkills: skills.allSkills,
        ghost: partnerUtil.initGhost(),
        aptitude: partnerUtil.initAptitude(opts.cId)
    };
    return character;
}

partnerUtil.initGhost = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var data = {"level":0};

    if(dataType == "string") {
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
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//武器

        necklace: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//项链
        helmet: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//头盔
        armor: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//护甲
        belt: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//腰带
        legguard: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//护腿
        amulet: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//护符
        shoes: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        },//鞋
        ring: {
            epid: 0,
            level: 0,
            forgeLevel: 0,
            inlay: equipmentUtil.initInlay()
        }//戒指
    };

    if(dataType == "string") {
        data = JSON.stringify(data);
    }
    return data;
}

partnerUtil.initPartnerV2 = function(opts) {
    var hero = dataApi.herosV2.findById(opts.cId);

    var partner = dataApi.partners.findById(opts.cId);
    var level = partner.level;
    var skills = new Skills(opts);
    skills.initSkillsV2(opts.cId);

    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: hero.name,
        buffs: buffUtil.getInitBuff(),
        experience: formulaV2.calculateAccumulated_xp(level),
        level: level,
        trait: hero.trait,
        starLevel: 0,
        starLevelExperience: 0,
        needExp: formulaV2.calculateXpNeeded(level + 1),
        accumulated_xp: formulaV2.calculateAccumulated_xp(level),
        photo: '',
        hp: formulaV2.calculateHp(hero.hp, hero.addHp, level),
        maxHp: formulaV2.calculateHp(hero.hp, hero.addHp, level),
        anger: 0,
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
        counter: formulaV2.calculateCounter(hero.counter, level),
        equipments: partnerUtil.initEquipments(),
        /*skills: {
            currentSkill: skills.currentSkill,
            activeSkills: skills.activeSkills,
            passiveSkills: skills.passiveSkills
        },*/
        currentSkills: skills.currentSkills,
        allSkills: skills.allSkills,
        ghost: partnerUtil.initGhost(),
        aptitude: partnerUtil.initAptitude(opts.cId)
    };
    return character;
}
var defaultZX = function(level) {
    var i = [], c = 0;
    if(level< 25) {
        
    }else if(level < 55) {
        c = parseInt((level-25)/5)+3;
    }else{
        c = 9;
    }
    return {
        i: i,
        c: c
    };
}
partnerUtil.getPlayer = function(opts) {
    var hero = dataApi.herosV2.findById(opts.cId);

    var skills = new Skills(opts);
    var character = {
        ZX: opts.replies.ZX ? JSON.parse(opts.replies.ZX) : defaultZX(opts.level),
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.replies.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.replies.nickname,
        experience: parseInt(opts.replies.experience),
        level: opts.level,
        trait: parseInt(opts.replies.trait || hero.trait),
        starLevel: parseInt(opts.replies.starLevel || 0),
        starLevelExperience: parseInt(opts.replies.starLevelExperience || 0),
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
        /*skills: {
            currentSkill: opts.replies.currentSkill ? JSON.parse(opts.replies.currentSkill) : {},
            activeSkills: JSON.parse(opts.replies.activeSkills),
            passiveSkills: JSON.parse(opts.replies.passiveSkills)
        },*/
        currentSkills: JSON.parse(opts.replies.currentSkills || skills.initCurrentSkills("string")),
        allSkills: JSON.parse(opts.replies.allSkills || skills.initAllSkills("string")).allSkills,
        buffs: opts.replies.buffs ? JSON.parse(opts.replies.buffs).buffs : buffUtil.getInitBuff(),
        ghost: JSON.parse(opts.replies.ghost || partnerUtil.initGhost("string")),
        aptitude: JSON.parse(opts.replies.aptitude || partnerUtil.initAptitude(opts.cId, "string"))
    };
    return character;
}

partnerUtil.getPlayerV2 = function(opts) {
    var hero = dataApi.herosV2.findById(opts.cId);

    var skills = new Skills(opts);
    var character = {
        ZX: opts.replies.ZX ? JSON.parse(opts.replies.ZX) : defaultZX(opts.level),
        id: "S" + opts.serverId + "C" + opts.characterId + "P" + opts.partnerId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        kindId: opts.cId,
        cId: opts.cId,
        userId: opts.replies.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.replies.nickname,
        experience: parseInt(opts.replies.experience),
        level: opts.level,
        trait: parseInt(opts.replies.trait || hero.trait),
        starLevel: parseInt(opts.replies.starLevel || 0),
        starLevelExperience: parseInt(opts.replies.starLevelExperience || 0),
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
        /*skills: {
         currentSkill: opts.replies.currentSkill ? JSON.parse(opts.replies.currentSkill) : {},
         activeSkills: JSON.parse(opts.replies.activeSkills),
         passiveSkills: JSON.parse(opts.replies.passiveSkills)
         },*/
        currentSkills: JSON.parse(opts.replies.currentSkills || skills.initCurrentSkills("string")),
        allSkills: JSON.parse(opts.replies.allSkills || skills.initAllSkills("string")).allSkills,
        buffs: opts.replies.buffs ? JSON.parse(opts.replies.buffs).buffs : buffUtil.getInitBuff(),
        ghost: JSON.parse(opts.replies.ghost || partnerUtil.initGhost("string")),
        aptitude: JSON.parse(opts.replies.aptitude || partnerUtil.initAptitude(opts.cId, "string"))
    };
    return character;
}