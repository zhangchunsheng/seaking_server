/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: equipment
 */
/**
 * Module dependencies
 */

var util = require('util');
var Entity = require('./entity/entity');
var EntityType = require('../consts/consts').EntityType;
var Persistent = require('./persistent');

/**
 * Initialize a new 'Equipments' with the given 'opts'.
 * Equipments inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Equipments = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.weapon = {
        epid: opts.weapon.epid || 0,
        level: opts.weapon.level
    };//武器

    this.necklace = {
        epid: opts.necklace.epid || 0,//项链
        level: opts.necklace.level
    };
    this.helmet = {
        epid: opts.helmet.epid || 0,//头盔
        level: opts.helmet.level
    };
    this.armor = {
        epid: opts.armor.epid || 0,//护甲
        level: opts.armor.level
    };
    this.belt = {
        epid: opts.belt.epid || 0,//腰带
        level: opts.belt.level
    };
    this.legguard = {
        epid: opts.legguard.epid || 0,//护腿
        level: opts.legguard.level
    };
    this.amulet = {
        epid: opts.amulet.epid || 0,//护符
        level: opts.amulet.level
    };
    this.shoes = {
        epid: opts.shoes.epid || 0,//鞋
        level: opts.shoes.level
    };
    this.ring = {
        epid: opts.ring.epid || 0,//戒指
        level: opts.ring.level
    };
};

util.inherits(Equipments, Persistent);

var dict = [
    'weapon',//武器
    'necklace',//项链
    'helmet',//头盔
    'armor' ,//护甲
    'belt',//腰带
    'legguard',//护腿
    'amulet',//护符
    'shoes',//鞋
    'ring'//戒指
];

//Get equipment by type
Equipments.prototype.get = function(type) {
    return this[type];
};

//Equip equipment by type and id
Equipments.prototype.equip = function(type, equip) {
    this[type] = {
        epid: equip.epid,
        level: equip.level
    };
    this.save();
};

//Unequip equipment by type
Equipments.prototype.unEquip = function(type) {
    this[type] = {
        epid: 0,
        level: 0
    };
    this.save();
};

/**
 *
 * @param type
 * @param equipment_levelup
 * @returns {number}
 */
Equipments.prototype.upgradeByMaterial = function(player, type, equipment_levelup) {
    var status = 0;
    return status;
}

/**
 *
 * @param type
 * @param equipment_levelup
 * @returns {number}
 */
Equipments.prototype.upgradeByMoney = function(player, type, equipment_levelup) {
    var status = 0;
    if(player.money >= equipment_levelup.upgradeMoney) {
        player.money -= equipment_levelup.upgradeMoney;
        status = 1;
        this[type].level += 1;
        player.updateTaskRecord(consts.TaskGoalType.UPGRADE_EQUIPMENT, {
            itemId: this[type].epid,
            itemNum: this[type].level
        });
        this.save();
        player.save();
    } else {
        status = 0;
    }
    return status;
}

/**
 * strip
 */
Equipments.prototype.strip = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    return {
        characterId: characterId,
        serverId: this.serverId,
        registerType: this.registerType,
        loginName: this.loginName,
        weapon: this.weapon,
        necklace: this.necklace,
        helmet: this.helmet,
        armor: this.armor,
        belt: this.belt,
        legguard: this.legguard,
        amulet: this.amulet,
        shoes: this.shoes,
        ring: this.ring
    }
};

/**
 * getInfo
 */
Equipments.prototype.getInfo = function() {
    return {
        weapon: this.weapon,
        necklace: this.necklace,
        helmet: this.helmet,
        armor: this.armor,
        belt: this.belt,
        legguard: this.legguard,
        amulet: this.amulet,
        shoes: this.shoes,
        ring: this.ring
    }
};

/**
 * Expose 'Equipments' constructor.
 */
module.exports = Equipments;

