/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-31
 * Description: arenaHandler
 */
var area = require('../../../domain/area/area');
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var playerDao = require('../../../dao/playerDao');
var async = require('async');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var formula = require('../../../consts/formula');
var Player = require('../../../domain/entity/player');
var EntityType = require('../../../consts/consts').EntityType;
var PackageType = require('../../../consts/consts').PackageType;
var consts = require('../../../consts/consts');

var handler = module.exports;

/**
 * 购买物品
 * @param msg
 * @param session
 * @param next
 */
handler.buyItem = function(msg, session, next) {
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
};