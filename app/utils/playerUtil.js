/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: playerUtil
 */
var dataApi = require('./dataApi');
var Player = require('../domain/entity/player');
var utils = require("./utils");
var buffUtil = require("./buffUtil");
var equipmentUtil = require("./equipmentUtil");
var formula = require('../consts/formula');
var formulaV2 = require('../consts/formulaV2');
var equipmentsDao = require('../dao/equipmentsDao');
var taskDao = require('../dao/taskDao');
var packageDao = require('../dao/packageDao');
var aptitudeService = require('../services/character/aptitudeService');
var ghostService = require('../services/character/ghostService');
var Tasks = require('../domain/tasks');

var playerUtil = module.exports;

playerUtil.initCharacter = function(opts) {
    var hero = dataApi.heros.findById(opts.cId);
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        cId: opts.cId,
        userId: opts.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.nickname,
        isRandom: opts.isRandom,
        currentScene: "city01",
        x: 1000,
        y: 100,
        experience: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        level: opts.level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, opts.level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        photo: '',
        buffs: buffUtil.getInitBuff(),
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), opts.level),
        anger: 0,
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), opts.level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), opts.level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), opts.level),
        sunderArmor: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), opts.level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), opts.level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), opts.level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), opts.level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), opts.level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), opts.level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), opts.level),
        gameCurrency: playerUtil.initGameCurrency(),
        money: playerUtil.initMoney(),
        equipments: playerUtil.initEquipments(),
        package: opts.package,
        skills: {
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        },
        formation: [{playerId:"S" + opts.serverId + "C" + opts.characterId},null,null,null,null,null,null],
        partners: [],
        gift: [],
        ghost: playerUtil.initGhost(),
        ghostNum: playerUtil.initGhostNum(),
        aptitude: playerUtil.initAptitude(opts.cId),
        curTasks: opts.curTasks,
        currentIndu: {"induId":0}
    };
    return character;
}

playerUtil.initGameCurrency = function() {
    return 100;
}

playerUtil.initMoney = function() {
    return 1000000;
}

playerUtil.initGhost = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var data = {"level":0};

    if(dataType = "string") {
        data = JSON.stringify(data);
    }
    return data;
}

playerUtil.initGhostNum = function() {
    return 1000;
}

playerUtil.initAptitude = function(cId, dataType) {
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

playerUtil.initEquipments = function(dataType) {
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

    if(dataType = "string") {
        data = JSON.stringify(data);
    }
    return data;
}

playerUtil.initCharacterV2 = function(opts) {
    var hero = dataApi.herosV2.findById(opts.cId);
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        cId: opts.cId,
        userId: opts.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.nickname,
        isRandom: opts.isRandom,
        currentScene: "city01",
        x: 1000,
        y: 100,
        experience: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        level: opts.level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, opts.level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, opts.level),
        photo: '',
        buffs: buffUtil.getInitBuff(),
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
        gameCurrency: playerUtil.initGameCurrency(),
        money: playerUtil.initMoney(),
        equipments: playerUtil.initEquipments(),
        package: opts.package,
        skills: {
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        },
        formation: [{playerId:"S" + opts.serverId + "C" + opts.characterId},null,null,null,null,null,null],
        partners: [],
        gift: [],
        ghost: playerUtil.initGhost(),
        ghostNum: playerUtil.initGhostNum(),
        aptitude: playerUtil.initAptitude(opts.cId),
        curTasks: opts.curTasks,
        currentIndu: {"induId":0}
    };
    return character;
}

playerUtil.getCharacter = function(opts) {
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        cId: opts.cId,
        showCIds: JSON.parse(opts.replies.showCIds || '{"stage":"' + opts.cId + '"}'),
        userId: opts.replies.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.replies.nickname,
        currentScene: opts.replies.currentScene,
        x: parseInt(opts.replies.x),
        y: parseInt(opts.replies.y),
        experience: parseInt(opts.replies.experience),
        buffs: JSON.parse(opts.replies.buffs).buffs,
        level: parseInt(opts.level),
        needExp: parseInt(opts.replies.needExp),
        accumulated_xp: parseInt(opts.replies.accumulated_xp),
        photo: opts.replies.photo,
        hp: parseInt(opts.replies.hp),
        maxHp: parseInt(opts.replies.maxHp),
        anger: parseInt(opts.replies.anger),
        attack: parseInt(opts.replies.attack),
        defense: parseInt(opts.replies.defense),
        focus: parseFloat(opts.replies.focus),
        sunderArmor: parseFloat(opts.replies.sunderArmor || opts.replies.focus),
        speedLevel: parseInt(opts.replies.speedLevel),
        speed: parseFloat(opts.replies.speed),
        dodge: parseFloat(opts.replies.dodge),
        criticalHit: parseFloat(opts.replies.criticalHit),
        critDamage: parseFloat(opts.replies.critDamage),
        block: parseFloat(opts.replies.block),
        counter: parseFloat(opts.replies.counter),
        gameCurrency: parseInt(opts.replies.gameCurrency),
        money: parseInt(opts.replies.money),
        equipments: JSON.parse(opts.replies.equipments),
        package: JSON.parse(opts.replies.package),
        skills: {
            currentSkill: JSON.parse(opts.replies.currentSkill),
            activeSkills: JSON.parse(opts.replies.activeSkills),
            passiveSkills: JSON.parse(opts.replies.passiveSkills)
        },
        formation: JSON.parse(opts.replies.formation).formation,
        partners: JSON.parse(opts.replies.partners).partners,
        allPartners: JSON.parse(opts.replies.partners).allPartners || [],
        gift: JSON.parse(opts.replies.gift).gift,
        curTasks: {
            currentMainTask: JSON.parse(opts.replies.currentMainTask),
            currentBranchTask: JSON.parse(opts.replies.currentBranchTask),
            currentDayTask: JSON.parse(opts.replies.currentDayTask),
            currentExerciseTask: JSON.parse(opts.replies.currentExerciseTask)
        },
        ghost: JSON.parse(opts.replies.ghost || playerUtil.initGhost("string")),
        ghostNum: opts.replies.ghostNum || 0,
        aptitude: JSON.parse(opts.replies.aptitude || playerUtil.initAptitude(opts.cId, "string")),
        currentIndu: JSON.parse(opts.replies.currentIndu)
    };
    return character;
}

playerUtil.getPKCharacter = function(opts) {
    var character = {
        id: "S" + opts.serverId + "C" + opts.characterId,
        characterId: "S" + opts.serverId + "C" + opts.characterId,
        cId: opts.cId,
        userId: opts.replies.userId,
        serverId: opts.serverId,
        registerType: opts.registerType,
        loginName: opts.loginName,
        nickname: opts.replies.nickname,
        currentScene: opts.replies.currentScene,
        x: parseInt(opts.replies.x),
        y: parseInt(opts.replies.y),
        experience: parseInt(opts.replies.experience),
        buffs: JSON.parse(opts.replies.buffs).buffs,
        level: parseInt(opts.level),
        needExp: parseInt(opts.replies.needExp),
        accumulated_xp: parseInt(opts.replies.accumulated_xp),
        photo: opts.replies.photo,
        hp: parseInt(opts.replies.hp),
        maxHp: parseInt(opts.replies.maxHp),
        anger: parseInt(opts.replies.anger),
        attack: parseInt(opts.replies.attack),
        defense: parseInt(opts.replies.defense),
        focus: parseFloat(opts.replies.focus),
        sunderArmor: parseFloat(opts.replies.sunderArmor),
        speedLevel: parseInt(opts.replies.speedLevel),
        speed: parseFloat(opts.replies.speed),
        dodge: parseFloat(opts.replies.dodge),
        criticalHit: parseFloat(opts.replies.criticalHit),
        critDamage: parseFloat(opts.replies.critDamage),
        block: parseFloat(opts.replies.block),
        counter: parseFloat(opts.replies.counter),
        gameCurrency: parseInt(opts.replies.gameCurrency),
        money: parseInt(opts.replies.money),
        equipments: JSON.parse(opts.replies.equipments),
        skills: {
            currentSkill: JSON.parse(opts.replies.currentSkill),
            activeSkills: JSON.parse(opts.replies.activeSkills),
            passiveSkills: JSON.parse(opts.replies.passiveSkills)
        },
        formation: JSON.parse(opts.replies.formation).formation,
        partners: JSON.parse(opts.replies.partners).partners,
        ghost: JSON.parse(opts.replies.ghost || playerUtil.initGhost("string")),
        ghostNum: opts.replies.ghostNum || 0,
        aptitude: JSON.parse(opts.replies.aptitude || playerUtil.initAptitude(opts.cId, "string"))
    };
    return character;
}

playerUtil.getPlayer = function(character) {
    var player = new Player({
        userId: character.userId,
        serverId: character.serverId,
        registerType: character.registerType,
        loginName: character.loginName,
        id: character.characterId,
        cId: character.cId,
        showCIds: character.showCIds,
        kindId: character.cId,
        currentScene: character.currentScene,
        x: character.x,
        y: character.y,
        nickname: character.nickname,
        level: character.level,
        experience: character.experience,
        buffs: character.buffs,
        hp: character.hp,
        maxHp: character.maxHp,
        anger: character.anger,
        attack: character.attack,
        defense: character.defense,
        focus: character.focus,
        sunderArmor: character.sunderArmor,
        speedLevel: character.speedLevel,
        speed: character.speed,
        dodge: character.dodge,
        criticalHit: character.criticalHit,//暴击
        critDamage: character.critDamage,//暴击
        block: character.block,
        counter: character.counter,
        gameCurrency: character.gameCurrency,
        money: character.money,
        equipments: character.equipments,
        curTasks: character.curTasks,
        package: character.package,
        skills: character.skills,
        formation: character.formation,
        partners: character.partners,
        allPartners: character.allPartners,
        gift: character.gift,
        ghost: character.ghost,
        ghostNum: character.ghostNum,
        aptitude: character.aptitude,
        currentIndu: character.currentIndu
    });
    return player;
}

playerUtil.getPlayerV2 = function(character) {
    var player = new Player({
        userId: character.userId,
        serverId: character.serverId,
        registerType: character.registerType,
        loginName: character.loginName,
        id: character.characterId,
        cId: character.cId,
        showCIds: character.showCIds,
        kindId: character.cId,
        currentScene: character.currentScene,
        x: character.x,
        y: character.y,
        nickname: character.nickname,
        level: character.level,
        experience: character.experience,
        buffs: character.buffs,
        hp: character.hp,
        maxHp: character.maxHp,
        anger: character.anger,
        attack: character.attack,
        defense: character.defense,
        focus: character.focus,
        sunderArmor: character.sunderArmor,
        speedLevel: character.speedLevel,
        speed: character.speed,
        dodge: character.dodge,
        criticalHit: character.criticalHit,//暴击
        critDamage: character.critDamage,//暴击
        block: character.block,
        counter: character.counter,
        gameCurrency: character.gameCurrency,
        money: character.money,
        equipments: character.equipments,
        curTasks: character.curTasks,
        package: character.package,
        skills: character.skills,
        formation: character.formation,
        partners: character.partners,
        allPartners: character.allPartners,
        gift: character.gift,
        ghost: character.ghost,
        ghostNum: character.ghostNum,
        aptitude: character.aptitude,
        currentIndu: character.currentIndu
    });
    return player;
}

/**
 * createEntity
 * @param character
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 */
playerUtil.createEntity = function(character, serverId, registerType, loginName, characterId) {
    var equipments = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId);
    var package = packageDao.createNewPackage(character.package, serverId, registerType, loginName, characterId);
    var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks)
    });
    var aptitude = aptitudeService.createNewAptitude(character.aptitude, serverId, registerType, loginName, characterId);
    var ghost = ghostService.createNewGhost(character.ghost, serverId, registerType, loginName, characterId);
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    character.curTasksEntity = curTasks || {};
    character.aptitudeEntity = aptitude;
    character.ghostEntity = ghost;
};

/**
 * createPKEntity
 * @param player
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 */
playerUtil.createPKEntity = function(player, serverId, registerType, loginName, characterId) {
    var equipments = equipmentsDao.createNewEquipment(player.equipments, serverId, registerType, loginName, characterId);
    player.equipmentsEntity = equipments;
    var aptitude = aptitudeService.createNewAptitude(player.aptitude, serverId, registerType, loginName, characterId);
    player.aptitudeEntity = aptitude;
    var ghost = ghostService.createNewGhost(player.ghost, serverId, registerType, loginName, characterId);
    player.ghostEntity = ghost;
};

/**
 * 创建装备、背包、任务对象
 * @param character
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 */
playerUtil.createEPTInfo = function(character, serverId, registerType, loginName, characterId) {
    var equipments = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId);
    var package = packageDao.createNewPackage(character.package, serverId, registerType, loginName, characterId);
    var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks)
    });
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    character.curTasksEntity = curTasks || {};
}