/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: soul
 */
var playerService = require('../../app/services/playerService');
var userService = require('../../app/services/userService');
var partnerService = require('../../app/services/partnerService');
var packageService = require('../../app/services/packageService');
var soulPackageService = require('../../app/services/character/soulPackageService');
var equipmentsService = require('../../app/services/equipmentsService');
var taskService = require('../../app/services/taskService');
var redisService = require('../../app/services/redisService');
var Code = require('../../shared/code');
var utils = require('../../app/utils/utils');
var playerUtil = require('../../app/utils/playerUtil');
var consts = require('../../app/consts/consts');
var EntityType = require('../../app/consts/consts').EntityType;
var dataApi = require('../../app/utils/dataApi');
var area = require('../../app/domain/area/area');
var world = require('../../app/domain/world');
var async = require('async');

exports.index = function(req, res) {

}

/**
 * 融合
 * @param req
 * @param res
 */
exports.fusion = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var souls = msg.souls;// 魂魄 H1101,H1101
    var data = {};
    if(utils.empty(souls)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    souls = souls.split(",");
    var soulId;
    var hero;
    var flag = false;
    for(var i = 0 ; i < souls.length ; i++) {
        flag = false;
        soulId = souls[i];
        if(soulId.substring(0, 1) != "H") {
            flag = true;
        }
        hero = dataApi.herosV2.findById(soulId);
        if(!hero) {
            flag = true;
        }
        if(flag) {
            data = {
                code: Code.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }
    }
    var starLevel = 0;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var array = [];

        var character;
        character = player;

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        //check trait
        var trait = player.trait;
        for(var i = 0 ; i < souls.length ; i++) {
            flag = false;
            soulId = souls[i];
            hero = dataApi.herosV2.findById(soulId);
            if(trait != hero.trait) {
                flag = true;
            }
            if(flag) {
                data = {
                    code: Code.SOUL.NOT_SAME_TRAIT
                };
                utils.send(msg, res, data);
                return;
            }
        }

        //check experience
        if(player.trait <= player.starLevel) {
            data = {
                code: Code.SOUL.MAX_STARLEVEL
            };
            utils.send(msg, res, data);
            return;
        }
        var starLevelExperience = player.starLevelExperience;
        var needSouls = [];
        var soulFusionId = "";
        var upgradeStarNeedExp = playerUtil.getAccumulationStarLevelNeedExp(player);//累加的经验值
        var experience = 0;//传入的经验值
        for(var i = 0 ; i < souls.length ; i++) {
            soulId = souls[i];
            hero = dataApi.herosV2.findById(soulId);
            soulFusionId = "" + hero.trait + starLevel;
            experience += dataApi.soulFusion.findById(soulFusionId).experience;
        }

        var _starLevelExperience = experience + starLevelExperience;//新的经验值
        if(_starLevelExperience >= upgradeStarNeedExp) {
            player.starLevel++;
        }
        player.starLevelExperience = _starLevelExperience;
        needSouls = souls;

        // check soulPackage
        var soulPackage = character.soulPackageEntity;
        var items = [];
        var index = -1;
        for(var i = 0 ; i < needSouls.length ; i++) {
            index = -1;
            for(var j = 0 ; j < items.length ; j++) {
                if(items[j].itemId == needSouls[i]) {
                    index = j;
                }
            }
            if(index >= 0) {
                items[index].itemNum += 1;
            } else {
                items.push({
                    itemId: needSouls[i],
                    itemNum: 1
                });
            }
        }
        flag = soulPackage.checkItems(items);

        if(flag.length < items.length) {
            data = {
                code: Code.PACKAGE.NOT_ENOUGH_ITEM
            };
            utils.send(msg, res, data);
            return;
        }

        var soulsOfFusion = flag;
        var packageIndex = [];
        var item;
        for(var i = 0 ; i < soulsOfFusion.length ; i++) {
            for(var j = 0 ; j < soulsOfFusion[i].length ; j++) {
                item = player.soulPackageEntity.removeItem(soulsOfFusion[i][j].index, soulsOfFusion[i][j].itemNum);
                packageIndex.push({
                    index: soulsOfFusion[i][j].index,
                    itemId: item.itemId,
                    itemNum: item.itemNum
                });
            }
        }

        userService.getUpdatePlayerArray(array, player, ["starLevel", "starLevelExperience"]);
        soulPackageService.getUpdateArray(array, player);

        redisService.setData(array, function(err, reply) {
            data = {
                code: Code.OK,
                starLevel: player.starLevel,
                starLevelExperience: player.starLevelExperience,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
    });
}