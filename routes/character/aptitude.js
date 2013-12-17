/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: aptitude
 */
var playerService = require('../../app/services/playerService');
var userService = require('../../app/services/userService');
var aptitudeService = require('../../app/services/character/aptitudeService');
var packageService = require('../../app/services/packageService');
var equipmentsService = require('../../app/services/equipmentsService');
var taskService = require('../../app/services/taskService');
var redisService = require('../../app/services/redisService');
var Code = require('../../shared/code');
var utils = require('../../app/utils/utils');
var partnerUtil = require('../../app/utils/partnerUtil');
var consts = require('../../app/consts/consts');
var EntityType = require('../../app/consts/consts').EntityType;
var dataApi = require('../../app/utils/dataApi');
var area = require('../../app/domain/area/area');
var world = require('../../app/domain/world');
var async = require('async');

exports.index = function(req, res) {

}

exports.upgrade = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , type = msg.type;

    var mtype = msg.mtype;// 金币类型 1 - 金币 2 - 元宝
    if(utils.empty(mtype)) {
        mtype = 0;
    }

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
    if(type < 1 || type > 5) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var array = [];

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

        var aptitude = character.aptitude;
        if(utils.empty(aptitude)) {
            data = {
                code: Code.CHARACTER.NO_APTITUDEDATA
            };
            utils.send(msg, res, data);
            return;
        }

        // check upgradeDate
        var date = new Date();
        var upgradeDate = aptitude.upgradeDate || 1;
        var time = date.getTime();
        if(time < upgradeDate) {
            data = {
                code: Code.CHARACTER.WRONG_DATE
            };
            utils.send(msg, res, data);
            return;
        }
        aptitude[type].count = parseInt(aptitude[type].count);
        aptitude.count = parseInt(aptitude.count);
        if(aptitude[type].count <= 0) {
            data = {
                code: Code.CHARACTER.TOP_LEVEL
            };
            utils.send(msg, res, data);
            return;
        }
        if(utils.getDate(time) == utils.getDate(upgradeDate)) {
            // check money gamecurrency
            if(mtype != 0) {
                if(mtype == consts.MONEY_TYPE.GOLDEN) {
                    var money = parseInt(aptitude.upgradeTimeOneDay) * consts.upgradeApititude.money;
                    if(player.money >= money) {
                        player.money = player.money - money;
                        aptitude[type].level = parseInt(aptitude[type].level) + 1;
                        aptitude.upgradeTimeOneDay += 1;
                        aptitude[type].count--;
                        aptitude.count--;
                    } else {
                        data = {
                            code: Code.SHOP.NOT_ENOUGHT_MONEY
                        };
                        utils.send(msg, res, data);
                        return;
                    }
                } else if(mtype == consts.MONEY_TYPE.GAME_CURRENCY) {
                    var gameCurrency = parseInt(aptitude.upgradeTimeOneDay) * consts.upgradeApititude.gameCurrency;
                    if(player.gameCurrency >= gameCurrency) {
                        player.gameCurrency = player.gameCurrency - gameCurrency;
                        aptitude[type].level = parseInt(aptitude[type].level) + 1;
                        aptitude.upgradeTimeOneDay += 1;
                        aptitude[type].count--;
                        aptitude.count--;
                    } else {
                        data = {
                            code: Code.SHOP.NOT_ENOUGHT_GAMECURRENCY
                        };
                        utils.send(msg, res, data);
                        return;
                    }
                } else {
                    data = {
                        code: Code.SHOP.WRONG_MONEY_TYPE
                    };
                    utils.send(msg, res, data);
                    return;
                }
            } else {
                data = {
                    code: Code.CHARACTER.NO_FREETIME_LEFT
                };
                utils.send(msg, res, data);
                return;
            }
        } else {
            aptitude[type].level = parseInt(aptitude[type].level) + 1;
            aptitude.upgradeDate = time;
            aptitude.upgradeTimeOneDay = 1;
            aptitude[type].count--;
            aptitude.count--;
        }
        aptitudeService.upgrade(array, player, character, type, function(err, reply) {
            data = {
                code: Code.OK,
                level: reply,
                count: aptitude[type].count,
                money: player.money,
                gameCurrency: player.gameCurrency
            };
            utils.send(msg, res, data);
        });
    });
}