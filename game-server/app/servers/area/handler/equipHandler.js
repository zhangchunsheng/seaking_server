/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: equipHandler
 */
/**
 * Module dependencies
 */

var handler = module.exports;
var area = require('../../../domain/area/area');
var dataApi = require('../../../util/dataApi');
var logger = require('pomelo-logger').getLogger(__filename);
var PackageType = require('../../../consts/consts').PackageType;
var utils = require('../../../util/utils');
var consts = require('../../../consts/consts');

/**
 * 装载武器
 * @param msg
 * @param session
 * @param next
 */
handler.wearWeapon = function(msg, session, next) {
    var index = msg.index;
    var weaponId = msg.weaponId;
    var pkgType = PackageType.WEAPONS;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;

    logger.info(player.packageEntity);
    var packageIndex = -1;
    if(player.packageEntity.checkItem(pkgType, index, weaponId) > 0) {
        var item = player.packageEntity[pkgType].items[index];
        logger.info(item);
        var eq = dataApi.equipment.findById(item.itemId);
        logger.info(eq);
        if(!eq || player.level < eq.useLevel) {
            next(null, {
                status: -1//等级不够
            });
            return;
        }

        packageIndex = player.equip(pkgType, item, index);
        player.updateTaskRecord(consts.TaskGoalType.EQUIPMENT, {
            itemId: item.itemId
        });

        status = 1;
    } else {
        status = -2;//没有该武器
    }
    next(null, {
        status: status,
        packageIndex: packageIndex
    });
}

/**
 * 卸载武器
 * @param msg
 * @param session
 * @param next
 */
handler.unWearWeapon = function(msg, session, next) {
    var weaponId = msg.weaponId;
    var type = consts.EqType.WEAPON;

    var player = area.getPlayer(session.get('playerId'));
    var status = false;
    var result = {};
    var packageIndex = -1;

    if(player.equipmentsEntity.get(type).epid == 0) {// 没有武器
        next(null, {
            status: -2
        });
        return;
    }

    if(player.equipmentsEntity.get(type).epid != weaponId) {// 武器不正确
        next(null, {
            status: -1
        });
        return;
    }

    result = player.packageEntity.addItem(player, PackageType.WEAPONS, {
        itemId: player.equipmentsEntity.get(type).epid,
        itemNum: 1,
        level: player.equipmentsEntity.get(type).level
    });
    packageIndex = result.index;
    if(packageIndex.length > 0) {
        player.unEquip(type);
        status = true;
    }

    next(null, {
        status: status,
        packageIndex: packageIndex
    });
}

/**
 * Equip equipment, handle client' request
 *
 * @param {Object} msg, message
 * @param {Session} session
 * @api public
 */

handler.equip = function(msg, session, next) {
    var pkgType = msg.pkgType;
    var index = msg.index;
    var eqId = msg.eqId;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;

    var item = player.packageEntity[pkgType].items[index];

    if(typeof item == "undefined") {
        next(null, {
            status: -3
        });
        return;
    }

    if(item.itemId != eqId) {//no item in package
        next(null, {
            status: -2
        });
        return;
    }

    var packageIndex = -1;

    var eq =  dataApi.equipment.findById(item.itemId);
    if(!eq || player.level < eq.useLevel) {
        next(null, {
            status: -1
        });
        return;
    }

    packageIndex = player.equip(pkgType, item, index);
    player.updateTaskRecord(consts.TaskGoalType.EQUIPMENT, {
        itemId: item.itemId
    });

    status = 1;

    next(null, {
        status: status,
        packageIndex: packageIndex
    });
};

/**
 * Unequip equipment, handle client' request
 *
 * @param {Object} msg
 * @param {Session} session
 * @api public
 */
handler.unEquip = function(msg, session, next) {
    var epId = msg.eqId;
    var type = msg.type;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;
    var result = {};
    var packageIndex = -1;

    if(player.equipmentsEntity.get(type).epid == 0) {// 没有装备
        next(null, {
            status: -2
        });
        return;
    }

    if(player.equipmentsEntity.get(type).epid != epId) {// 装备不正确
        next(null, {
            status: -1
        });
        return;
    }

    var pkgType = "";
    if(epId.length == 5) {
        pkgType = consts.PackageType.WEAPONS;
    } else {
        pkgType = consts.PackageType.EQUIPMENTS;
    }

    result = player.packageEntity.addItem(player, pkgType, {
        itemId: player.equipmentsEntity.get(type).epid,
        itemNum: 1,
        level: player.equipmentsEntity.get(type).level
    });
    packageIndex = result.index;
    if (packageIndex.length > 0) {
        player.unEquip(type);
        status = 1;
    }

    next(null, {
        status: status,
        packageIndex: packageIndex
    });
};

