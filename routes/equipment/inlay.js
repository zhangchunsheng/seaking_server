/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: inlay
 */
var playerService = require('../../app/services/playerService');
var userService = require('../../app/services/userService');
var partnerService = require('../../app/services/partnerService');
var packageService = require('../../app/services/packageService');
var equipmentsService = require('../../app/services/equipmentsService');
var taskService = require('../../app/services/taskService');
var redisService = require('../../app/services/redisService');
var Code = require('../../shared/code');
var utils = require('../../app/utils/utils');
var consts = require('../../app/consts/consts');
var EntityType = require('../../app/consts/consts').EntityType;
var dataApi = require('../../app/utils/dataApi');
var area = require('../../app/domain/area/area');
var world = require('../../app/domain/world');
var async = require('async');

exports.index = function(req, res) {

}

/**
 * 镶嵌
 * @param req
 * @param res
 */
exports.inlay = function(req, res) {
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
    var index = msg.index;
    var diamondId = msg.diamondId;//宝石
    var cellId = msg.cellId;//镶嵌位置

    var data = {};

    if(utils.empty(index) ) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    var pkgType = PackageType.DIAMOND;

    if(!utils.checkEquipmentPositionType(type)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = 0;

        var item = player.packageEntity.items[index];

        var character;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        } else {
            character = player;
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        if(typeof item == "undefined" || item.itemId != diamondId) {
            data = {
                //status: -2
                code: Code.PACKAGE.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }

        var diamond =  dataApi.diamonds.findById(diamondId);
        if(!diamond) {
            data = {
                code: Code.PACKAGE.NOT_EXIST_ITEM
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

        var eq = dataApi.equipments.findById(epId);
        if(eq.attrId != diamond.attrId) {
            data = {
                //status: -1//等级不够
                code: Code.EQUIPMENT.NOT_SAME_ATTRID
            };
            utils.send(msg, res, data);
            return;
        }

        if(!character.equipmentsEntity.checkInlayCell(type, cellId)) {
            data = {
                code: Code.EQUIPMENT.WRONG_CELLID
            };
            utils.send(msg, res, data);
            return;
        }

        var packageIndex = character.inlay(pkgType, item, index, player, type, cellId);

        if(packageIndex == null || packageIndex.length == 0) {
            data = {
                code: Code.PACKAGE.NOT_ENOUGHT_SPACE
            };
            utils.send(msg, res, data);
            return;
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
                //status: status
                code: Code.OK,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 摘除
 * @param req
 * @param res
 */
exports.unInlay = function(req, res) {
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
    var diamondId = msg.diamondId;//宝石
    var cellId = msg.cellId;//镶嵌位置

    var data = {};

    var pkgType = PackageType.DIAMOND;

    if(!utils.checkEquipmentPositionType(type)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = 0;

        var character;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        } else {
            character = player;
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

        if(typeof character.equipmentsEntity.get(type).inlay.diamonds[cellId] == "undefined") {
            data = {
                code: Code.EQUIPMENT.WRONG_CELLID
            };
            utils.send(msg, res, data);
            return;
        }

        if(character.equipmentsEntity.get(type).inlay.diamonds[cellId] != diamondId) {
            data = {
                code: Code.EQUIPMENT.WRONG_CELLID
            };
            utils.send(msg, res, data);
            return;
        }

        var result = player.packageEntity.addItem(player, pkgType, {
            itemId: character.equipmentsEntity.get(type).inlay.diamonds[cellId],
            itemNum: 1
        });
        if(result == null || result.index.length == 0) {
            data = {
                code: Code.PACKAGE.NOT_ENOUGHT_SPACE
            };
            utils.send(msg, res, data);
            return;
        }
        var packageIndex = result.index;
        if (packageIndex.length > 0) {
            character.unInlay(type, cellId);
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
                //status: status
                code: Code.OK,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
    });
}