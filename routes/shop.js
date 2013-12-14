/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: shop
 */
var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var shopService = require('../app/services/shopService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var dataApi = require('../app/utils/dataApi');
var PackageType = require('../app/consts/consts').PackageType;
var consts = require('../app/consts/consts');
var async = require("async");

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 购买物品
 * @param req
 * @param res
 */
exports.buyItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var itemId = msg.itemId
        , itemNum = msg.itemNum;
    var npcId = msg.npcId;
    if(!itemId || !itemNum || !npcId){
        return utils.send(msg, res, {
            code: Code.ARGUMENT_EXCEPTION
        });
    }
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    // var currentScene = msg.currentScene;
    
    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var result = false;

        /*if(currentScene != player.currentScene) {
            data = {
                code: Code.AREA.WRONG_CURRENTSCENE
            };
            utils.send(msg, res, data);
            return;
        }*/
        var shops = dataApi.shops.findById(npcId);
        if(!shops ) {
            return utils.send(msg, res, {
                code: Code.SHOP.NOT_EXIST_NPCSHOP
            });
        }
        var items = shops.shopData;
        for(var i = 0 ; i < items.length ; i++) {
            if(items[i].indexOf(itemId) == 0) {
                result = true;
                break;
            }
        }
        if(!result) {
            data = {
                code: Code.SHOP.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }
        
//      if(!) {
//          next(null,{
//              code:Code.FAIL
//          });
//          return;
//      }
        var itemInfo = {};
        var type ;
        if(itemId.indexOf("D") >= 0) {
            type = PackageType.ITEMS;
            itemInfo = dataApi.item.findById(itemId);
        } else if(itemId.indexOf("E") >= 0) {
            type = PackageType.EQUIPMENTS;
            itemInfo = dataApi.equipment.findById(itemId);
        } else if(itemId.indexOf("W") >= 0){
            type = PackageType.WEAPONS;
            itemInfo = dataApi.weapons.findById(itemId);
        }
        console.log("itemInfo:",itemInfo);
        if(typeof itemInfo == "undefined" || itemInfo == null) {
            data = {
                code: Code.SHOP.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }
        if(type == PackageType.WEAPONS || type == PackageType.EQUIPMENTS) {
            if(itemNum != 1) {
                utils.send(msg, res, {
                     code:Code.ARGUMENT_EXCEPTION
                });
                return;    
            }
        } else {
            /*if(itemInfo.pileNum < itemNum) {
                utils.send(msg, res, {code:'数据错误'});
                return;      
            }*/
        }
        var price = itemInfo.price;
        var costMoney = price * itemNum;
        console.log("Price:",price);
        if(player.money < costMoney) {
            data = {
                code: Code.SHOP.NOT_ENOUGHT_MONEY
            };
            utils.send(msg, res, data);
            return ;
        }
        
        var item = {
            itemId: itemId,
            itemNum: itemNum,
            level: 1
        }

        var result = player.buyItem(type, item, costMoney);
        
        /*if(result.packageIndex == -1) {
            data = {
                code: Code.PACKAGE.NOT_ENOUGHT_SPACE
            };
            utils.send(msg, res, data);
        } else {
            data = {
                code: consts.MESSAGE.RES,
                money: result.money,
                packageIndex: result.packageIndex
            };
            utils.send(msg, res, data);
        }*/
        if(!result || result.packageChange.length == 0) {
            data = {
                code: Code.PACKAGE.NOT_ENOUGHT_SPACE
            };
            utils.send(msg, res, data);
        } else {
            data = {
                code: consts.MESSAGE.RES,
                data:{
                    money: result.money,
                    packageChange: result.packageChange
                }
                
                //costMoney: costMoney
            };
            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(player.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                utils.send(msg, res, data);
            });
        }
    });
}