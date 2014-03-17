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
var packageDao = require('../dao/packageDao');
var aptitudeService = require('../services/character/aptitudeService');
var ghostService = require('../services/character/ghostService');
var altarService = require('../services/character/altarService');
var skillService = require('../services/skillService');
var miscsService = require('../services/character/miscsService');
var soulPackageService = require('../services/character/soulPackageService');
var formationService = require('../services/formationService');
var messageService = require('../services/messageService');
var Tasks = require('../domain/tasks');

var playerUtil = module.exports;

playerUtil.initCharacter = function(opts) {
    var level = 1;
    var date = new Date();

    var hero = dataApi.heros.findById(opts.cId);

    var curTasks = {
        currentMainTask: {"taskId": "Task10101", "status": 1, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
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
        formation: playerUtil.initFormation(opts),
        lastFormation: playerUtil.initFormation(opts),
        tacticals: playerUtil.initTacticals().tacticals,
        partners: [],
        miscs: [],
        soulPackage: playerUtil.initSoulPackage(),
        altar: playerUtil.initAltar(),
        gift: [],
        pushMessage: playerUtil.initPushMessage(),
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

playerUtil.initFormation = function(opts, dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var formation = {formation:{4:{playerId:"S" + opts.serverId + "C" + opts.characterId}},tactical:{id:"F101",level:0}};

    if(dataType == "string") {
        formation = JSON.stringify(formation);
    }
    return formation;
}

playerUtil.initTacticals = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var tacticalsData = dataApi.formations.all();
    var data = [];

    for(var i in tacticalsData) {
        var tactical = {
            id: tacticalsData[i].id,
            level: 0
        };
        if(tacticalsData[i].id == "F101") {
            tactical.active = 1;
        }
        data.push(tactical);
    }
    var tacticals = {
        "tacticals": data
    };

    if(dataType == "string") {
        tacticals = JSON.stringify(tacticals);
    }
    return tacticals;
}

playerUtil.initPushMessage = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var pushMessage = {"pushMessage":[]};

    if(dataType == "string") {
        pushMessage = JSON.stringify(pushMessage);
    }
    return pushMessage;
}

playerUtil.initSoulPackage = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var soulPackage = {"itemCount": 64, "items": {}};

    if(dataType == "string") {
        soulPackage = JSON.stringify(soulPackage);
    }
    return soulPackage;
}

playerUtil.initAltar = function(dataType) {
    if(typeof dataType == "undefined")
        dataType = "json";

    var altar = {"loyalty": 0, "extractionTimes":{"1":{"lastExtractionTime":0},"2":{"lastExtractionTime":0},"3":{"lastExtractionTime":0}}};

    if(dataType == "string") {
        altar = JSON.stringify(altar);
    }
    return altar;
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
        trait: hero.trait,
        starLevel: 0,
        starLevelExperience: 0,
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
        formation: playerUtil.initFormation(opts),
        lastFormation: playerUtil.initFormation(opts),
        tacticals: playerUtil.initTacticals().tacticals,
        partners: [],
        miscs: [],
        soulPackage: playerUtil.initSoulPackage(),
        altar: playerUtil.initAltar(),
        gift: [],
        pushMessage: playerUtil.initPushMessage(),
        ghost: playerUtil.initGhost(),
        ghostNum: playerUtil.initGhostNum(),
        aptitude: playerUtil.initAptitude(opts.cId),
        curTasks: curTasks,
        currentIndu: {"induId":0}
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
var Pets = require("../domain/pet").Pets;
var Tasks = require("../domain/_task").Tasks;
playerUtil.getCharacter = function(opts) {
    var hero = dataApi.herosV2.findById(opts.cId);

    var skills = new Skills(opts);
    var pets = new Pets(opts.replies.pets).update();
    var character = {
        duplicate: opts.replies.duplicate? JSON.parse(opts.replies.duplicate):opts.replies.duplicate,
        tasks: new Tasks(opts.replies.tasks),
        tl: opts.replies.tl ?JSON.parse(opts.replies.tl): opts.replies.tl,
        pets: pets,
        ZX: opts.replies.ZX ? JSON.parse(opts.replies.ZX) : defaultZX(opts.level) ,
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
        formation: JSON.parse(opts.replies.formation || playerUtil.initFormation(opts, "string")),
        lastFormation: JSON.parse(opts.replies.lastFormation || playerUtil.initFormation(opts, "string")),
        tacticals: JSON.parse(opts.replies.tacticals || playerUtil.initTacticals("string")).tacticals,
        partners: JSON.parse(opts.replies.partners).partners,
        allPartners: JSON.parse(opts.replies.partners).allPartners || [],
        miscs: JSON.parse(opts.replies.miscs || '{"miscs":[]}').miscs,
        soulPackage: JSON.parse(opts.replies.soulPackage || playerUtil.initSoulPackage("string")),
        altar: JSON.parse(opts.replies.altar || playerUtil.initAltar("string")),
        gift: JSON.parse(opts.replies.gift).gift,
        pushMessage: JSON.parse(opts.replies.pushMessage || playerUtil.initPushMessage("string")).pushMessage,
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
    var hero = dataApi.herosV2.findById(opts.cId);

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
        formation: JSON.parse(opts.replies.formation || playerUtil.initFormation(opts, "string")),
        lastFormation: JSON.parse(opts.replies.lastFormation || playerUtil.initFormation(opts, "string")),
        tacticals: JSON.parse(opts.replies.tacticals || playerUtil.initTacticals("string")).tacticals,
        partners: JSON.parse(opts.replies.partners).partners,
        ghost: JSON.parse(opts.replies.ghost || playerUtil.initGhost("string")),
        ghostNum: opts.replies.ghostNum || 0,
        aptitude: JSON.parse(opts.replies.aptitude || playerUtil.initAptitude(opts.cId, "string"))
    };
    return character;
}

playerUtil.getPlayer = function(character) {
    var player = new Player({
        duplicate: character.duplicate,
        tasks: character.tasks,
        tl: character.tl,
        pets: character.pets,
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
        trait: character.trait,
        starLevel: character.starLevel,
        starLevelExperience: character.starLevelExperience,
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
        lastFormation: character.lastFormation,
        tacticals: character.tacticals,
        partners: character.partners,
        allPartners: character.allPartners,
        miscs: character.miscs,
        soulPackage: character.soulPackage,
        altar: character.altar,
        gift: character.gift,
        pushMessage: character.pushMessage,
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
        trait: character.trait,
        starLevel: character.starLevel,
        starLevelExperience: character.starLevelExperience,
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
        lastFormation: character.lastFormation,
        tacticals: character.tacticals,
        partners: character.partners,
        allPartners: character.allPartners,
        miscs: character.miscs,
        soulPackage: character.soulPackage,
        altar: character.altar,
        gift: character.gift,
        pushMessage: character.pushMessage,
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
   /* var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks, character),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks, character)
    });*/
    var aptitude = aptitudeService.createNewAptitude(character.aptitude, serverId, registerType, loginName, characterId, character);
    var ghost = ghostService.createNewGhost(character.ghost, serverId, registerType, loginName, characterId, character);
    var altar = altarService.createNewAltar({}, serverId, registerType, loginName, characterId, character);
    var skills = skillService.createNewSkills({}, serverId, registerType, loginName, characterId, character);
    var miscs = miscsService.createNewMiscs({}, serverId, registerType, loginName, characterId, character);
    var soulPackage = soulPackageService.createNewSoulPackage({}, serverId, registerType, loginName, characterId, character);
    var formation = formationService.createNewFormation({}, serverId, registerType, loginName, characterId, character);
    var pushMessage = messageService.createNewPushMessage({}, serverId, registerType, loginName, characterId, character);
    pushMessage.on("modifyData", function() {

    });
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
   // character.curTasksEntity = curTasks || {};
    character.aptitudeEntity = aptitude;
    character.ghostEntity = ghost;
    character.altarEntity = altar;
    character.skillsEntity = character.skills = skills;
    character.miscsEntity = miscs;
    character.soulPackageEntity = soulPackage;
    character.formationEntity = formation;
    character.pushMessageEntity = pushMessage;
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
    var skills = skillService.createNewSkills({}, serverId, registerType, loginName, characterId, player);
    player.skillsEntity = player.skills = skills;
    var formation = formationService.createNewFormation({}, serverId, registerType, loginName, characterId, player);
    player.formationEntity = formation;
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
    /*var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks, character),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks, character)
    });*/
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    //character.curTasksEntity = curTasks || {};
}

/**
 * getAccumulationStarLevelNeedExp
 * @param player
 */
playerUtil.getAccumulationStarLevelNeedExp = function(player) {
    var num = player.starLevel;
    var soulFusionId = "";
    var upgradeStarNeedExp = 0;
    for(var i = 0 ; i <= num ; i++) {
        soulFusionId = "" + player.trait + num;
        upgradeStarNeedExp += dataApi.soulFusion.findById(soulFusionId).upgradeStarNeedExp;
    }
    return upgradeStarNeedExp;
}

/**
 * calculatorStarLevel
 * @param player
 * @param starLevelExperience 新的经验值
 */
playerUtil.calculatorStarLevel = function(player, starLevelExperience) {
    var trait = player.trait;
    var starLevel = 0;
    var soulFusionId = "";
    var upgradeStarNeedExp = 0;

    soulFusionId = "" + trait + starLevel;
    upgradeStarNeedExp += dataApi.soulFusion.findById(soulFusionId).upgradeStarNeedExp;
    if(starLevelExperience >= upgradeStarNeedExp) {
        return playerUtil._calculatorStarLevel(trait, starLevel, upgradeStarNeedExp, starLevelExperience);
    } else {
        return starLevel;
    }
}

playerUtil._calculatorStarLevel = function(trait, starLevel, upgradeStarNeedExp, starLevelExperience) {
    var soulFusionId = "";

    starLevel++;
    soulFusionId = "" + trait + starLevel;
    upgradeStarNeedExp += dataApi.soulFusion.findById(soulFusionId).upgradeStarNeedExp;
    if(starLevel < trait && starLevelExperience >= upgradeStarNeedExp) {
        return playerUtil._calculatorStarLevel(trait, starLevel, upgradeStarNeedExp, starLevelExperience);
    } else {
        return starLevel;
    }
}