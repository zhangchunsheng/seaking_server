/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: equip
 */
var authService = require('../app/services/authService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 装载武器
 * @param req
 * @param res
 */
exports.wearWeapon = function(req, res) {
    var msg = req.query;
    var session = req.session;

    logUtil.info(logger, session, msg);

    var index = msg.index;
    var weaponId = msg.weaponId;
    var pkgType = PackageType.WEAPONS;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;

    var packageIndex = -1;
    if(player.packageEntity.checkItem(pkgType, index, weaponId) > 0) {
        var item = player.packageEntity[pkgType].items[index];
        var eq = dataApi.equipment.findById(item.itemId);
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
 * @param req
 * @param res
 */
exports.unWearWeapon = function(req, res) {
    var msg = req.query;
    var session = req.session;

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
        status = 1;
    }

    next(null, {
        status: status,
        packageIndex: packageIndex
    });
}

/**
 * 装载装备
 * @param req
 * @param res
 */
exports.equip = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var pkgType = msg.pkgType;
    var index = msg.index;
    var eqId = msg.eqId;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;

    var item = player.packageEntity[pkgType].items[index];

    if(typeof item == "undefined") {
        next(null, {
            status: -2
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
}

/**
 * 卸载装备
 * @param req
 * @param res
 */
exports.unEquip = function(req, res) {
    var msg = req.query;
    var session = req.session;

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
}

/**
 * 升级
 * @param req
 * @param res
 */
exports.upgrade = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var epId = msg.eqId;
    var type = msg.type;

    var player = area.getPlayer(session.get('playerId'));
    var status = 0;

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

    var level = player.equipmentsEntity.get(type).level;
    level += 1;
    var equipment_levelup = dataApi.equipmentLevelup.findById(epId + level);

    if(equipment_levelup.upgradeMaterial != 0 && equipment_levelup.upgradeMaterial.length > 1) {
        status = player.equipmentsEntity.upgradeByMaterial(player, type, equipment_levelup);
    } else {
        status = player.equipmentsEntity.upgradeByMoney(player, type, equipment_levelup);
    }

    next(null, {
        status: status
    });
}