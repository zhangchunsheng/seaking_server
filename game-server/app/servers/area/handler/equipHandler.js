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

/**
 * 转载武器
 * @param msg
 * @param session
 * @param next
 */
handler.wearWeapon = function(msg, session, next) {
    var index = msg.index;
    var weaponId = msg.weaponId;
    var type = PackageType.WEAPONS;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;

    logger.info(player.packageEntity);
    var packageIndex = -1;
    if(player.packageEntity.checkItem(type, index, weaponId) > 0) {
        var item = player.packageEntity[type].items[index];
        logger.info(item);
        var eq = dataApi.equipment.findById(item.itemId);
        logger.info(eq);
        if(!eq || player.level < eq.useLevel) {
            next(null, {
                status: -1//等级不够
            });
            return;
        }

        packageIndex = player.equip(type, item, index);

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
    var player = area.getPlayer(session.get('playerId'));
    var status = false;
    var packageIndex = -1;
    if (msg.putInBag) {
        packageIndex = player.packageEntity.addItem({
            id: player.equipmentsEntity.get(msg.type),
            type: 'equipment'
        });
        if (packageIndex > 0) {
            player.unEquip(msg.type);
            status = true;
        }
    } else {
        player.unEquip(msg.type);
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
    var player = area.getPlayer(session.get('playerId'));
    var status = false;

    var item = player.packageEntity.items[msg.index];
    var packageIndex = -1;
    if (item) {
        var eq =  dataApi.equipment.findById(item.id);
        if(!eq || player.level < eq.heroLevel) {
            next(null, {status: false});
            return;
        }

        packageIndex = player.equip(eq.kind, eq.id);
        player.packageEntity.removeItem(msg.index);

        status = true;
    }
    next(null, {status: status, packageIndex: packageIndex});
};

/**
 * Unequip equipment, handle client' request
 *
 * @param {Object} msg
 * @param {Session} session
 * @api public
 */
handler.unEquip = function(msg, session, next) {
    var player = area.getPlayer(session.get('playerId'));
    var status = false;
    var packageIndex = -1;
    if (msg.putInBag) {
        packageIndex = player.packageEntity.addItem({
            id: player.equipmentsEntity.get(msg.type),
            type: 'equipment'
        });
        if (packageIndex > 0) {
            player.unEquip(msg.type);
            status = true;
        }
    } else {
        player.unEquip(msg.type);
        status = true;
    }

    next(null, {status: status, packageIndex: packageIndex});
};

