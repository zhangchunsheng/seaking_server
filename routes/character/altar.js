/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-01-21
 * Description: altar
 */
var playerService = require('../../app/services/playerService');
var userService = require('../../app/services/userService');
var partnerService = require('../../app/services/partnerService');
var altarService = require('../../app/services/character/altarService');
var miscsService = require('../../app/services/character/miscsService');
var soulPackageService = require('../../app/services/character/soulPackageService');
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
 * 人物抽取
 * @param req
 * @param res
 */
exports.extraction = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var altarId = msg.altarId;// 祭坛Id
    if(utils.empty(altarId)) {
        altarId = 1;
    }

    var playerId = session.playerId;

    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    var altarData = dataApi.altars.findById(altarId);
    if(!altarData) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
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
        //判断背包已满

        var costMoney = altarData.extractionCost;
        if(costMoney > character.money) {
            data = {
                code: Code.SHOP.NOT_ENOUGHT_MONEY
            };
            utils.send(msg, res, data);
            return;
        }

        var altar = character.altar;//{"loyalty":"100","extractionTimes":{"1":{"lastExtractionTime":0},"2":{"lastExtractionTime":0},"3":{"lastExtractionTime":0}}}
        // check refrigerationTime
        var date = new Date();
        var lastExtractionTime = altar.extractionTimes[altarId].lastExtractionTime;
        var refrigerationTime = altarData.refrigerationTime * 60 * 60 * 1000;
        var time = date.getTime();
        var pastTime = time - lastExtractionTime;
        if(pastTime <= 0) {
            data = {
                code: Code.ALTAR.IN_REFRIGERATION
            };
            utils.send(msg, res, data);
            return;
        }
        if(pastTime < refrigerationTime) {
            data = {
                code: Code.ALTAR.IN_REFRIGERATION
            };
            utils.send(msg, res, data);
            return;
        }

        player.money = player.money - costMoney;
        altar.extractionTimes[altarId].lastExtractionTime = time;
        var random = utils.random(1, altarData.totalRandomNum);
        var heroRandoms = altarData.heroRandoms;
        var heroRandom = {};
        for(var i = 0 ; i < heroRandoms.length ; i++) {
            if(random >= heroRandoms[i].startRandomNum && random <= heroRandoms[i].endRandomNum) {
                heroRandom = heroRandoms[i];
                break;
            }
        }
        var cId = heroRandom.cId;
        var type = 1;//1 - 实体 2 - 魂魄
        var miscs = character.miscsEntity;
        var soulPackage = character.soulPackageEntity;

        type = miscs.checkHero(cId);
        var packageIndex = [];
        if(type == 1) {
            miscs.setHero(cId);
        } else {
            var item = {
                itemId: cId,
                itemNum: 1
            }
            packageIndex = soulPackage.addItem(player, item);
            packageIndex = packageIndex.index;
        }
        userService.getUpdatePlayerAttributeArray(array, player);
        altarService.getUpdateArray(array, player);
        miscsService.getUpdateArray(array, player);
        soulPackageService.getUpdateArray(array, player);

        redisService.setData(array, function(err, reply) {
            data = {
                code: Code.OK,
                lastExtractionTime: time,
                type: type,
                cId: cId,
                packageIndex: packageIndex,
                money: player.money,
                gameCurrency: player.gameCurrency
            };
            utils.send(msg, res, data);
        });
    });
}