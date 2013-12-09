/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: playerUtil
 */
var dataApi = require('./dataApi');
var Player = require('../domain/entity/player');
var buffUtil = require("./buffUtil");
var formula = require('../consts/formula');
var formulaV2 = require('../consts/formulaV2');

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
        gameCurrency: 100,
        money: 1000000,
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
        package: opts.package,
        skills: {
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        },
        formation: [{playerId:"S" + opts.serverId + "C" + opts.characterId},null,null,null,null,null,null],
        partners: [],
        gift: [],
        curTasks: opts.curTasks,
        currentIndu: {"induId":0}
    };
    return character;
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
        gameCurrency: 100,
        money: 1000000,
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
        package: opts.package,
        skills: {
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        },
        formation: [{playerId:"S" + opts.serverId + "C" + opts.characterId},null,null,null,null,null,null],
        partners: [],
        gift: [],
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
        currentIndu: JSON.parse(opts.replies.currentIndu)
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
        currentIndu: character.currentIndu
    });
    return player;
}