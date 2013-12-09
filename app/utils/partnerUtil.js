/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-09
 * Description: partnerUtil
 */
var dataApi = require('./dataApi');
var Player = require('../domain/entity/player');
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
            currentSkill: opts.skills.currentSkill,
            activeSkills: opts.skills.activeSkills,
            passiveSkills: opts.skills.passiveSkills
        }
    };
    return character;
}