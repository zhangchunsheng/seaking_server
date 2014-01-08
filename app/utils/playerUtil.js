/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: playerUtil
 */
var dataApi = require('./dataApi');
var Player = require('../domain/entity/player');
var Skills = require('../domain/skill/skills');
var utils = require("./utils");
var buffUtil = require("./buffUtil");
var equipmentUtil = require("./equipmentUtil");
var packageUtil = require("./packageUtil");
var formula = require('../consts/formula');
var formulaV2 = require('../consts/formulaV2');
var equipmentsDao = require('../dao/equipmentsDao');
var taskDao = require('../dao/taskDao');
var packageDao = require('../dao/packageDao');
var aptitudeService = require('../services/character/aptitudeService');
var ghostService = require('../services/character/ghostService');
var skillService = require('../services/skillService');
var miscsService = require('../services/character/miscsService');
var Tasks = require('../domain/tasks');

var playerUtil = module.exports;

playerUtil.initCharacter = function(opts) {
    var level = 1;
    var date = new Date();

    var hero = dataApi.heros.findById(opts.cId);

    var curTasks = {
        currentMainTask: {"taskId": "Task10101", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
        currentBranchTask: {"taskId": "Task20201", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
        currentDayTask: [{"taskId": "Task30201","status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}],
        currentExerciseTask: {"taskId": "Task40201", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}
    };

    var skills = new Skills(opts);
    //skills.initSkills(opts.cId);
    skills.initSkillsV2(opts.cId);

    //var package = packageUtil.initPackage(opts.cId);
    var package = packageUtil.initPackageV2(opts.cId);

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
        experience: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
        level: level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
        photo: '',
        buffs: buffUtil.getInitBuff(),
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
        anger: 0,
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), level),
        sunderArmor: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), level),
        gameCurrency: playerUtil.initGameCurrency(),
        money: playerUtil.initMoney(),
        equipments: playerUtil.initEquipments(),
        package: package,
        skills: {
            currentSkill: skills.currentSkill,
            activeSkills: skills.activeSkills,
            passiveSkills: skills.passiveSkills
        },
        currentSkills: skills.currentSkills,
        allSkills: skills.allSkills,
        formation: [{playerId:"S" + opts.serverId + "C" + opts.characterId},null,null,null,null,null,null],
        partners: [],
        miscs: [],
        gift: [],
        ghost: playerUtil.initGhost(),
        ghostNum: playerUtil.initGhostNum(),
        aptitude: playerUtil.initAptitude(opts.cId),
        curTasks: curTasks,
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

    if(dataType == "string") {
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

playerUtil.initAstrology =function(dataType) {
    var data = {

    }
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

    if(dataType == "string") {
        data = JSON.stringify(data);
    }
    return data;
}

playerUtil.initCharacterV2 = function(opts) {
    var level = 1;
    var date = new Date();

    var hero = dataApi.herosV2.findById(opts.cId);

    var curTasks = {
        currentMainTask: {"taskId": "Task10101", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
        currentBranchTask: {"taskId": "Task20201", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
        currentDayTask: [{"taskId": "Task30201","status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}],
        currentExerciseTask: {"taskId": "Task40201", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}
    };

    var skills = new Skills(opts);
    skills.initSkillsV2(opts.cId);

    var package = packageUtil.initPackageV2(opts.cId);
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
        experience: formulaV2.calculateAccumulated_xp(level),
        level: level,
        needExp: formulaV2.calculateXpNeeded(level + 1),
        accumulated_xp: formulaV2.calculateAccumulated_xp(level),
        photo: '',
        buffs: buffUtil.getInitBuff(),
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
        gameCurrency: playerUtil.initGameCurrency(),
        money: playerUtil.initMoney(),
        equipments: playerUtil.initEquipments(),
        package: package,
        /*skills: {
            currentSkill: skills.currentSkill,
            activeSkills: skills.activeSkills,
            passiveSkills: skills.passiveSkills
        },*/
        currentSkills: skills.currentSkills,
        allSkills: skills.allSkills,
        formation: [{playerId:"S" + opts.serverId + "C" + opts.characterId},null,null,null,null,null,null],
        partners: [],
        miscs: [],
        gift: [],
        ghost: playerUtil.initGhost(),
        ghostNum: playerUtil.initGhostNum(),
        aptitude: playerUtil.initAptitude(opts.cId),
        curTasks: curTasks,
        currentIndu: {"induId":0}
    };
    return character;
}

playerUtil.getCharacter = function(opts) {
    var skills = new Skills(opts);
    var character = {
        ZX: JSON.parse(opts.replies.ZX || "{\"i\":[],\"c\":3}"),
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
        /*skills: {
            currentSkill: JSON.parse(opts.replies.currentSkill),
            activeSkills: JSON.parse(opts.replies.activeSkills),
            passiveSkills: JSON.parse(opts.replies.passiveSkills)
        },*/
        currentSkills: JSON.parse(opts.replies.currentSkills || skills.initCurrentSkills("string")),
        allSkills: JSON.parse(opts.replies.allSkills || skills.initAllSkills("string")).allSkills,
        formation: JSON.parse(opts.replies.formation).formation,
        partners: JSON.parse(opts.replies.partners).partners,
        allPartners: JSON.parse(opts.replies.partners).allPartners || [],
        miscs: JSON.parse(opts.replies.miscs || '{"miscs":[]}').miscs,
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
    var skills = new Skills(opts);
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
        /*skills: {
            currentSkill: JSON.parse(opts.replies.currentSkill),
            activeSkills: JSON.parse(opts.replies.activeSkills),
            passiveSkills: JSON.parse(opts.replies.passiveSkills)
        },*/
        currentSkills: JSON.parse(opts.replies.currentSkills || skills.initCurrentSkills("string")),
        allSkills: JSON.parse(opts.replies.allSkills || skills.initAllSkills("string")).allSkills,
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
        ZX: character.ZX,
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
        skills: character.skills || {},
        currentSkills: character.currentSkills || {},
        allSkills: character.allSkills || {},
        formation: character.formation,
        partners: character.partners,
        allPartners: character.allPartners,
        miscs: character.miscs,
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
        skills: character.skills || {},
        currentSkills: character.currentSkills || {},
        allSkills: character.allSkills || {},
        formation: character.formation,
        partners: character.partners,
        allPartners: character.allPartners,
        miscs: character.miscs,
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
    var equipments = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId, character);
    var package = packageDao.createNewPackage(character.package, serverId, registerType, loginName, characterId, character);
    var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks, character),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks, character)
    });
    var aptitude = aptitudeService.createNewAptitude(character.aptitude, serverId, registerType, loginName, characterId, character);
    var ghost = ghostService.createNewGhost(character.ghost, serverId, registerType, loginName, characterId, character);
    var skills = skillService.createNewSkills(character.currentSkills, serverId, registerType, loginName, characterId, character);
    var miscs = miscsService.createNewMiscs({}, serverId, registerType, loginName, characterId, character);
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    character.curTasksEntity = curTasks || {};
    character.aptitudeEntity = aptitude;
    character.ghostEntity = ghost;
    character.skillsEntity = skills;
    character.miscsEntity = miscs;
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
    var equipments = equipmentsDao.createNewEquipment(player.equipments, serverId, registerType, loginName, characterId, player);
    player.equipmentsEntity = equipments;
    var aptitude = aptitudeService.createNewAptitude(player.aptitude, serverId, registerType, loginName, characterId, player);
    player.aptitudeEntity = aptitude;
    var ghost = ghostService.createNewGhost(player.ghost, serverId, registerType, loginName, characterId, player);
    player.ghostEntity = ghost;
    var skills = skillService.createNewSkills(player.currentSkills, serverId, registerType, loginName, characterId, player);
    player.skillsEntity = skills;
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
    var equipments = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId, character);
    var package = packageDao.createNewPackage(character.package, serverId, registerType, loginName, characterId, character);
    var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks, character),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks, character)
    });
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    character.curTasksEntity = curTasks || {};
}