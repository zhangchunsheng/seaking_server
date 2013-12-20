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
var consts = require('../consts/consts');
var equipmentUtil = require('../utils/equipmentUtil');

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
        level: opts.weapon.level,
        forgeLevel: opts.weapon.forgeLevel || 0,
        inlay: opts.weapon.inlay || equipmentUtil.initInlay()
    };//武器

    this.necklace = {
        epid: opts.necklace.epid || 0,//项链
        level: opts.necklace.level,
        forgeLevel: opts.necklace.forgeLevel || 0,
        inlay: opts.necklace.inlay || equipmentUtil.initInlay()
    };
    this.helmet = {
        epid: opts.helmet.epid || 0,//头盔
        level: opts.helmet.level,
        forgeLevel: opts.helmet.forgeLevel || 0,
        inlay: opts.helmet.inlay || equipmentUtil.initInlay()
    };
    this.armor = {
        epid: opts.armor.epid || 0,//护甲
        level: opts.armor.level,
        forgeLevel: opts.armor.forgeLevel || 0,
        inlay: opts.armor.inlay || equipmentUtil.initInlay()
    };
    this.belt = {
        epid: opts.belt.epid || 0,//腰带
        level: opts.belt.level,
        forgeLevel: opts.belt.forgeLevel || 0,
        inlay: opts.belt.inlay || equipmentUtil.initInlay()
    };
    this.legguard = {
        epid: opts.legguard.epid || 0,//护腿
        level: opts.legguard.level,
        forgeLevel: opts.legguard.forgeLevel || 0,
        inlay: opts.legguard.inlay || equipmentUtil.initInlay()
    };
    this.amulet = {
        epid: opts.amulet.epid || 0,//护符
        level: opts.amulet.level,
        forgeLevel: opts.amulet.forgeLevel || 0,
        inlay: opts.amulet.inlay || equipmentUtil.initInlay()
    };
    this.shoes = {
        epid: opts.shoes.epid || 0,//鞋
        level: opts.shoes.level,
        forgeLevel: opts.shoes.forgeLevel || 0,
        inlay: opts.shoes.inlay || equipmentUtil.initInlay()
    };
    this.ring = {
        epid: opts.ring.epid || 0,//戒指
        level: opts.ring.level,
        forgeLevel: opts.ring.forgeLevel || 0,
        inlay: opts.ring.inlay || equipmentUtil.initInlay()
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

Equipments.prototype.syncData = function() {

}

//Equip equipment by type and id
Equipments.prototype.equip = function(type, equip) {
    this[type] = {
        epid: equip.epid,
        level: equip.level,
        forgeLevel: equip.forgeLevel || 0,
        inlay: equip.inlay || equipmentUtil.initInlay()
    };
    this.save();
};

//Unequip equipment by type
Equipments.prototype.unEquip = function(type) {
    this[type] = {
        epid: 0,
        level: 0,
        forgeLevel: 0,
        inlay: {}
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
        this[type].epid = equipment_levelup.id;
        //this[type].level = parseInt(this[type].level) + 1;
        this[type].level = equipment_levelup.strengthenLevel;
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
 *
 * @param type
 * @param equipment_levelup
 * @returns {Object}
 */
Equipments.prototype.upgradeByMoneyV2 = function(player, type, equipment_levelup) {
    var result = {};
    result.status = 0;
    if(player.money >= 1000) {
        player.money -= 1000;
        result.status = 1;
        result.money = player.money;
        this[type].level = parseInt(this[type].level) + 1;
        player.updateTaskRecord(consts.TaskGoalType.UPGRADE_EQUIPMENT, {
            itemId: this[type].epid,
            itemNum: this[type].level
        });
        this.save();
        player.save();
    } else {
        result.status = 0;
    }
    return result;
}

/**
 *
 * @param type
 * @param equipment_levelup
 * @returns {number}
 */
Equipments.prototype.forgeUpgradeByMoney = function(player, type, equipment_levelup) {
    var status = 0;
    status = 1;
    this[type].forgeLevel = parseInt(this[type].forgeLevel) + 1;
    player.updateTaskRecord(consts.TaskGoalType.UPGRADE_EQUIPMENT, {
        itemId: this[type].epid,
        itemNum: this[type].forgeLevel
    });
    this.save();
    player.save();
    return status;
}

/**
 * 打造升级
 * @param player
 * @param type
 * @param forge
 * @param items
 * @returns {Object}
 */
Equipments.prototype.forgeUpgradeByMaterial = function(player, type, forge, items) {
    var result = {};
    this[type].forgeLevel = parseInt(this[type].forgeLevel) + 1;
    //打造开启镶嵌位
    this.openInlayCell(type);
    //更新背包
    result.packageInfo = [];
    var item;
    for(var i = 0 ; i < items.length ; i++) {
        for(var j = 0 ; j < items[i].length ; j++) {
            item = player.packageEntity.removeItem(items[i][j].index, items[i][j].itemNum);
            result.packageInfo.push({
                index: items[i][j].index,
                item: item
            });
        }
    }
    //更新任务
    player.updateTaskRecord(consts.TaskGoalType.FORGEUPGRADE_EQUIPMENT, {
        itemId: this[type].epid,
        itemNum: this[type].forgeLevel
    });
    this.save();
    player.save();

    result.status = 1;
    return result;
}

/**
 * 开启镶嵌位2 3 4 5
 * @param type
 */
Equipments.prototype.openInlayCell = function(type) {
    var diamonds = this[type].inlay.diamonds;
    var forgeLevel = this[type].forgeLevel;
    for(var i = 0 ; i < forgeLevel ; i++) {
        if(typeof diamonds[i + 2] == "undefined") {
            diamonds[i + 2] = 0;
        }
    }
}

/**
 * 检查镶嵌位置
 * @param type
 * @param cellId
 */
Equipments.prototype.checkInlayCell = function(type, cellId) {
    var inlay = this[type].inlay;
    var diamonds = inlay.diamonds;
    if(typeof diamonds[cellId] != "undefined") {
        return true;
    } else {
        return false;
    }
}

Equipments.prototype.getDiamond = function(type, cellId) {
    var inlay = this[type].inlay;
    var diamonds = inlay.diamonds;
    return diamonds[cellId];
}

/**
 * 镶嵌
 * @param type
 * @param cellId
 */
Equipments.prototype.inlay = function(type, cellId, diamond) {
    this[type].inlay.diamonds[cellId] = diamond.diamondId;
}

/**
 * 摘除宝石
 * @param type
 * @param cellId
 */
Equipments.prototype.unInlay = function(type, cellId) {
    this[type].inlay.diamonds[cellId] = 0;
}

/**
 * 更新装备ID
 */
Equipments.prototype.updateId = function() {
    if(this.weapon.epid != 0) {
        this.weapon.epid += this.weapon.level;
    }
    if(this.necklace.epid != 0) {
        this.necklace.epid += this.necklace.level;
    }
    if(this.helmet.epid != 0) {
        this.helmet.epid += this.helmet.level;
    }
    if(this.armor.epid != 0) {
        this.armor.epid += this.armor.level;
    }
    if(this.belt.epid != 0) {
        this.belt.epid += this.belt.level;
    }
    if(this.legguard.epid != 0) {
        this.legguard.epid += this.legguard.level;
    }
    if(this.amulet.epid != 0) {
        this.amulet.epid += this.amulet.level;
    }
    if(this.shoes.epid != 0) {
        this.shoes.epid += this.shoes.level;
    }
    if(this.ring.epid != 0) {
        this.ring.epid += this.ring.level;
    }
}

/**
 * strip
 */
Equipments.prototype.strip = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    //this.updateId();
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
    //this.updateId();
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

