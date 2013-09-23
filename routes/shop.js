/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: shop
 */
var shopService = require('../app/services/shopService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var dataApi = require('../app/utils/dataApi');
var PackageType = require('../app/consts/consts').PackageType;
var consts = require('../app/consts/consts');

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

    var wid = msg.wid
        , num = msg.num;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var result=false;

        var items = dataApi.shops.findById(player.currentScene).shopData;
        for(var i = 0 ; i < items.length ; i++) {
            if(items[i].indexOf(wid) == 0) {
                result = true;
                break;
            }
        }
        if(!result) {
            data = {
                code: Code.FAIL
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
        var type = "";
        if(wid.indexOf("D") >= 0) {
            type = PackageType.ITEMS;
            itemInfo = dataApi.item.findById(wid);
        } else if(wid.indexOf("W") >= 0) {
            type = PackageType.WEAPONS;
            itemInfo = dataApi.equipment.findById(wid);
        } else {
            type = PackageType.EQUIPMENTS;
            itemInfo = dataApi.equipment.findById(wid);
        }
        if(typeof itemInfo == "undefined" || itemInfo == null){
            data = {
                code: Code.SHOP.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return ;
        }
        var price = itemInfo.price;
        var costMoney = price * num;

        if(player.money < costMoney) {
            data = {
                code: Code.SHOP.NOT_ENOUGHT_MONEY
            };
            utils.send(msg, res, data);
            return ;
        }

        var item = {
            itemId: wid,
            itemNum: num,
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

        if(result.packageChange.length == 0) {
            data = {
                code: Code.PACKAGE.NOT_ENOUGHT_SPACE
            };
            utils.send(msg, res, data);
        } else {
            data = {
                code: consts.MESSAGE.RES,
                money: result.money,
                packageChange: result.packageChange
            };
            utils.send(msg, res, data);
        }
    });
}