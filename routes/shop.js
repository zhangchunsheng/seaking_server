/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: shop
 */
var shopService = require('../app/services/shopService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

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

    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , wid = msg.wid
        , num = msg.num;
    var player = area.getPlayer(session.get('playerId'));
    var result=false;
    logger.debug(wid);
    items = dataApi.shops.findById(player.currentScene).shopData;
    for(var i = 0 ; i < items.length ; i++) {
        if(items[i].indexOf(wid) == 0) {
            result = true;
            break;
        }
    }
    if(!result) {
        next(null, {
            code: Code.FAIL
        }) ;
        return;
    }


//    if(!) {
//        next(null,{
//            code:Code.FAIL
//        });
//        return;
//    }
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
        next(null,{
            code:Code.SHOP.NOT_EXIST_ITEM
        });
        return ;
    }
    var price = itemInfo.price;

    var costMoney = price * num;


    if(player.money < costMoney) {
        next(null, {
            code: Code.SHOP.NOT_ENOUGHT_MONEY
        });
        return ;
    }

    var item = {
        itemId: wid,
        itemNum: num,
        level: 1
    }

    var result = player.buyItem(type, item, costMoney);
    /*
     if(result.packageIndex == -1) {
     next(null, {
     code: Code.PACKAGE.NOT_ENOUGHT_SPACE
     });
     } else {
     next(null, {
     code: consts.MESSAGE.RES,
     money: result.money,
     packageIndex: result.packageIndex
     });
     }
     */
    if(result.packageChange.length == 0) {
        next(null, {
            code: Code.PACKAGE.NOT_ENOUGHT_SPACE
        });
    } else {
        next(null,{
            code: consts.MESSAGE.RES,
            money: result.money,
            packageChange: result.packageChange
        });
    }
}