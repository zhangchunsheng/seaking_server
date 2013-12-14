/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: equip
 */
var authService = require('../app/services/authService');
var userService = require('../app/services/userService');
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var partnerUtil = require('../app/utils/partnerUtil');
var PackageType = require('../app/consts/consts').PackageType;
var dataApi = require('../app/utils/dataApi');
var consts = require('../app/consts/consts');
var async = require('async');

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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    var index = msg.index;
    if(utils.empty(index) || index == 0) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    var weaponId = msg.weaponId;
    var pkgType = PackageType.WEAPONS;

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = 0;

        var packageIndex = -1;

        var character = player;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        //if(player.packageEntity.checkItem(pkgType, index, weaponId) > 0) {
            //var item = player.packageEntity[pkgType].items[index];
        if(player.packageEntity.checkItem(index, weaponId) > 0) {
            var item = player.packageEntity.items[index];
            // var eq = dataApi.equipment.findById(item.itemId);
            // var eq = dataApi.equipmentLevelup.findById(item.itemId);
            var eq = dataApi.equipments.findById(item.itemId);
            // if(!eq || player.level < eq.useLevel) {
            if(!eq) {
                data = {
                    //status: -1//等级不够
                    code: Code.EQUIPMENT.WRONG_WEAPON
                };
                utils.send(msg, res, data);
                return;
            }

            packageIndex = character.equip(pkgType, item, index, player);

            player.updateTaskRecord(consts.TaskGoalType.EQUIPMENT, {
                itemId: item.itemId
            });

            status = 1;

            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(character.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                data = {
                    //status: status,
                    code: Code.OK,
                    packageIndex: packageIndex
                };
                utils.send(msg, res, data);
            });
        } else {
            status = -2;//没有该武器
            data = {
                code: Code.PACKAGE.NOT_EXIST_ITEM,
                //status: status,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        }
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var characterId = utils.getRealCharacterId(playerId);

    var weaponId = msg.weaponId;
    var type = consts.EqType.WEAPON;

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = false;
        var result = {};
        var packageIndex = -1;

        var data = {};

        var character = player;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).epid == 0) {// 没有武器
            data = {
                //status: -2
                code: Code.EQUIPMENT.NO_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).epid != weaponId) {// 武器不正确
            data = {
                //status: -1
                code: Code.EQUIPMENT.WRONG_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        var epid = "";
        var level = 0;
        epid = character.equipmentsEntity.get(type).epid;
        level = character.equipmentsEntity.get(type).level;

        /*result = player.packageEntity.addItem(player, PackageType.WEAPONS, {
            itemId: epid,
            itemNum: 1,
            level: level
        });*/
        result = player.packageEntity.addItem(player, PackageType.WEAPONS, {
            itemId: epid,
            itemNum: 1,
            level: level,
            forgeLevel: character.equipmentsEntity.get(type).forgeLevel
        });
        packageIndex = result.index;
        if(packageIndex.length > 0) {
            character.unEquip(type);
            status = 1;
        }

        async.parallel([
            function(callback) {
                userService.updatePlayerAttribute(player, callback);
            },
            function(callback) {
                packageService.update(player.packageEntity.strip(), callback);
            },
            function(callback) {
                equipmentsService.update(character.equipmentsEntity.strip(), callback);
            },
            function(callback) {
                taskService.updateTask(player, player.curTasksEntity.strip(), callback);
            }
        ], function(err, reply) {
            data = {
                //status: status,
                code: Code.OK,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    var pkgType = msg.pkgType;
    var index = msg.index;
    var eqId = msg.eqId;
    //背包从0开始
    if(utils.empty(index) ) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    /*if(utils.empty(pkgType) || pkgType == 0) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }*/
    pkgType = PackageType.WEAPONS

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = 0;

        //var item = player.packageEntity[pkgType].items[index];
        var item = player.packageEntity.items[index];

        var character = player;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        if(typeof item == "undefined") {
            data = {
                //status: -2
                code: Code.PACKAGE.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }

        if(item.itemId != eqId) {//no item in package
            data = {
                //status: -2
                code: Code.PACKAGE.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }

        var packageIndex = -1;

        // var eq =  dataApi.equipment.findById(item.itemId);
        // var eq =  dataApi.equipmentLevelup.findById(item.itemId);
        var eq =  dataApi.equipments.findById(item.itemId);
        //if(!eq || player.level < eq.useLevel) {
        if(!eq) {
            data = {
                //status: -1
                code: Code.EQUIPMENT.WRONG_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        packageIndex = character.equip(pkgType, item, index, player);
        player.updateTaskRecord(consts.TaskGoalType.EQUIPMENT, {
            itemId: item.itemId
        });

        status = 1;

        async.parallel([
            function(callback) {
                userService.updatePlayerAttribute(player, callback);
            },
            function(callback) {
                packageService.update(player.packageEntity.strip(), callback);
            },
            function(callback) {
                equipmentsService.update(character.equipmentsEntity.strip(), callback);
            },
            function(callback) {
                taskService.updateTask(player, player.curTasksEntity.strip(), callback);
            }
        ], function(err, reply) {
            data = {
                //status: status,
                code: Code.OK,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var characterId = utils.getRealCharacterId(playerId);

    var epId = msg.eqId;
    var type = msg.type;

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = 0;
        var result = {};
        var packageIndex = -1;

        var data = {};

        var character = player;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).epid == 0) {// 没有装备
            data = {
                //status: -2
                code: Code.EQUIPMENT.NO_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).epid != epId) {// 装备不正确
            data = {
                //status: -1
                code: Code.EQUIPMENT.WRONG_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        var pkgType = "";
        if(epId.indexOf("W9") < 0) {
            pkgType = consts.PackageType.WEAPONS;
        } else {
            pkgType = consts.PackageType.EQUIPMENTS;
        }

        result = player.packageEntity.addItem(player, pkgType, {
            itemId: character.equipmentsEntity.get(type).epid,
            itemNum: 1,
            level: character.equipmentsEntity.get(type).level,
            forgeLevel: character.equipmentsEntity.get(type).forgeLevel
        });
        packageIndex = result.index;
        if (packageIndex.length > 0) {
            character.unEquip(type);
            status = 1;
        }

        async.parallel([
            function(callback) {
                userService.updatePlayerAttribute(player, callback);
            },
            function(callback) {
                packageService.update(player.packageEntity.strip(), callback);
            },
            function(callback) {
                equipmentsService.update(character.equipmentsEntity.strip(), callback);
            },
            function(callback) {
                taskService.updateTask(player, player.curTasksEntity.strip(), callback);
            }
        ], function(err, reply) {
            data = {
                //status: status,
                code: Code.OK,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var characterId = utils.getRealCharacterId(playerId);

    var epId = msg.eqId;
    var type = msg.type;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = 0;

        var character = player;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).epid == 0) {// 没有装备
            data = {
                //status: -2
                code: Code.EQUIPMENT.NO_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).epid != epId) {// 装备不正确
            data = {
                //status: -1
                code: Code.EQUIPMENT.WRONG_WEAPON
            };
            utils.send(msg, res, data);
            return;
        }

        var level = parseInt(character.equipmentsEntity.get(type).level);
        level += 1;
        /*var nextEqId = dataApi.equipmentLevelup.findById(epId).nextEqId;

        if(nextEqId == "") {
            data = {
                code: Code.EQUIPMENT.NOMORE_LEVEL
            };
            utils.send(msg, res, data);
            return;
        }*/

        // var equipment_levelup = dataApi.equipmentLevelup.findById(epId + level);
        // var equipment_levelup = dataApi.equipmentLevelup.findById(nextEqId);
        var equipment_levelup = dataApi.equipments.findById(epId);

        if(equipment_levelup.upgradeMaterial != 0 && equipment_levelup.upgradeMaterial.length > 1) {
            status = character.equipmentsEntity.upgradeByMaterial(player, type, equipment_levelup);
        } else {
            status = character.equipmentsEntity.upgradeByMoney(player, type, equipment_levelup);
        }

        if(status == 1) {
            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(character.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                data = {
                    //status: status
                    code: Code.OK
                };
                utils.send(msg, res, data);
            });
        } else {
            data = {
                //status: status
                code: Code.EQUIPMENT.NO_UPGRADE
            };
            utils.send(msg, res, data);
        }
    });
}