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
 var redis =  require('../../app/dao/redis/redis')
 , redisConfig = require('../../shared/config/redis');
 var TL = require("../../app/domain/tl").TL;
 var env = process.env.NODE_ENV || 'development';
 var battleDao = require("../../app/dao/_battleDao");
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
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
        /*if(!player.onces.altarExtraction) {
            var info = dataApi.onces.altarExtraction;
            var cId = info.cId;
            //var altar = character.altar;//{"loyalty":"100","extractionTimes":{"1":{"lastExtractionTime":0},"2":{"lastExtractionTime":0},"3":{"lastExtractionTime":0}}}
           // altar.loyalty = parseInt(altar.loyalty);
            //var type = 1;//1 - 实体 2 - 魂魄
            character.miscsEntity.checkHero(cId);
            var setArray = [
                ["select", redisConfig.database.SEAKING_REDIS_DB]
            ];
            var Key = utils.getDbKey(session);
            player.onces.altarExtraction = true;
            setArray.push(["hset", Key, "onces", JSON.stringify(player.onces)]);
            var soulPackage = {
                itemCount : player.soulPackageEntity.itemCount,
                items: player.soulPackageEntity.items
            }
            setArray.push(["hset", Key, "soulPackage", JSON.stringify(soulPackage)]);
            console.log(setArray);
            utils.send(msg, res, {
                code: Code.OK
            });
            return;
        }*/
        var miscs = character.miscsEntity;
        var soulPackage = character.soulPackageEntity;
        //判断背包已满
        if(soulPackage.isFull()) {
            data = {
                code: Code.ALTAR.FULL_SOULPACKAGE
            };
            utils.send(msg, res, data);
            return;
        }

        var costMoney = altarData.extractionCost;
        if(costMoney > character.money) {
            data = {
                code: Code.SHOP.NOT_ENOUGHT_MONEY
            };
            utils.send(msg, res, data);
            return;
        }

        var altar = character.altar;//{"loyalty":"100","extractionTimes":{"1":{"lastExtractionTime":0},"2":{"lastExtractionTime":0},"3":{"lastExtractionTime":0}}}
        altar.loyalty = parseInt(altar.loyalty);
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
            // （当前剩余冷却时间/总冷却时间）*（10/35/90）元宝
            // check gameCurrency
            var costGameCurrency = [10, 35, 90];
            var gameCurrency = Math.round(((refrigerationTime - pastTime) / refrigerationTime) * costGameCurrency[parseInt(altarId) - 1]);
            if(player.gameCurrency >= gameCurrency) {
                player.gameCurrency -= gameCurrency;
            } else {
                data = {
                    code: Code.ALTAR.IN_REFRIGERATION
                };
                utils.send(msg, res, data);
                return;
            }
        } else {

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

        //更新侠义值
        var loyalty = altarData.loyalty;
        altar.loyalty += loyalty;
        if(altar.loyalty > 9999) {
            altar.loyalty = 9999;
        }

        userService.getUpdatePlayerAttributeArray(array, player);
        altarService.getUpdateArray(array, player);
        miscsService.getUpdateArray(array, player);
        soulPackageService.getUpdateArray(array, player);

        var pastTime = 0;
        var leftTime = Math.round((refrigerationTime - pastTime) / 1000);
        if(leftTime < 0) {
            leftTime = 0;
        }
        console.log(array);
        utils.send(msg, res, data);
        /*redisService.setData(array, function(err, reply) {
            data = {
                code: Code.OK,
                loyalty: altar.loyalty,
                lastExtractionTime: time,
                leftTime: leftTime,
                type: type,
                cId: cId,
                packageIndex: packageIndex,
                money: player.money,
                gameCurrency: player.gameCurrency
            };
            utils.send(msg, res, data);
        });*/
    });
}

/**
 * 兑换
 * @param req
 * @param res
 */
exports.exchange = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var heroId = msg.heroId;
    var data = {};
    if(utils.empty(heroId)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    var playerId = session.playerId;

    var characterId = utils.getRealCharacterId(playerId);

    var altar_exchange = dataApi.altar_exchange.findById(heroId);
    if(!altar_exchange) {
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

        var miscs = character.miscsEntity;
        var soulPackage = character.soulPackageEntity;
        //判断背包已满
        if(soulPackage.isFull()) {
            data = {
                code: Code.ALTAR.FULL_SOULPACKAGE
            };
            utils.send(msg, res, data);
            return;
        }

        var altar = character.altar;//{"loyalty":"100","extractionTimes":{"1":{"lastExtractionTime":0},"2":{"lastExtractionTime":0},"3":{"lastExtractionTime":0}}}
        var needLoyalty = altar_exchange.needLoyalty;
        altar.loyalty = parseInt(altar.loyalty);
        if(needLoyalty > altar.loyalty) {
            data = {
                code: Code.ALTAR.NOT_ENOUGH_LOYALTY
            };
            utils.send(msg, res, data);
            return;
        }
        var cId = heroId;
        var type = 1;//1 - 实体 2 - 魂魄

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

        //更新侠义值
        altar.loyalty -= needLoyalty;

        userService.getUpdatePlayerAttributeArray(array, player);
        altarService.getUpdateArray(array, player);
        miscsService.getUpdateArray(array, player);
        soulPackageService.getUpdateArray(array, player);

        player.tasks.updateHero(heroId);
        redisService.setData(array, function(err, reply) {
            data = {
                code: Code.OK,
                loyalty: altar.loyalty,
                type: type,
                cId: cId,
                packageIndex: packageIndex
            };
            utils.send(msg, res, data);
        });
    });
}