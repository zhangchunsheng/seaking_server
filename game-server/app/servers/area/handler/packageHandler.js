/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-20
 * Description: playerHandler
 */

var area = require('../../../domain/area/area');
var messageService = require('../../../domain/messageService');
var timer = require('../../../domain/area/timer');
var world = require('../../../domain/world');
var userDao = require('../../../dao/userDao');
var actionManager = require('../../../domain/action/actionManager');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var code = require('../../../../../shared/code');
var dataApi = require('../../../util/dataApi');
var channelUtil = require('../../../util/channelUtil');
var PackageType = require('../../../consts/consts').PackageType;

var handler = module.exports;

//add equipment or item
handler.addItem = function(msg, session, next) {
    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;

    if (!itemId.match(/W|E|D/)) {
        next(null, {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION,
            packageIndex: 0
        });
    }
    var type = "";
    if(itemId.indexOf("W")) {
        type = PackageType.WEAPONS;
    } else if(itemId.indexOf("E")) {
        type = PackageType.EQUIPMENTS;
    } else if(itemId.indexOf("D")) {
        type = PackageType.ITEMS;
    }
    var item = {
        itemId: itemId,
        itemNum: itemNum,
        level: itemLevel
    }
    var player = area.getPlayer(session.get('playerId'));
    var packageIndex = player.packageEntity.addItem(type, item);

    next(null, {
        code: consts.MESSAGE.RES,
        packageIndex: packageIndex
    });
};

//drop equipment or item
handler.dropItem = function(msg, session, next) {
    var type = msg.type;
    var index = msg.index;

    var player = area.getPlayer(session.get('playerId'));

    player.packageEntity.removeItem(type, index);

    next(null, {
        code: consts.MESSAGE.RES,
        status: 1
    });
};

//Use item
handler.useItem = function(msg, session, next) {
    var type = msg.type;
    var index = msg.index;

    var player = area.getPlayer(session.get('playerId'));

    var status = player.useItem(type, index);

    next(null, {
        code: consts.MESSAGE.RES,
        status: status
    });
};

/**
 * sell item
 * @param msg
 * @param session
 * @param next
 */
handler.sellItem = function(msg, session, next) {
    var type = msg.type,
        itemId = msg.itemId,
        itemNum = msg.itemNum;
    var player = area.getPlayer(session.get('playerId'));
    var itemInfo={};
    if("items"==type){
        itemInfo = dataApi.item.findById(itemId);
    }else{
        itemInfo = dataApi.equipment.findById(itemId);
    }
    logger.info(itemInfo);
    if(!itemInfo){
        next(null,{
            code:code.PACKAGE.NOT_EXIST_ITEM
        });
        return;
    }
    var price = itemInfo.price;
    var incomeMoney = price * itemNum;
    var result = removeItem(msg,player,next);
    if(!!result){
        player.money += incomeMoney;
        player.save();
        next(null,{
            code:consts.MESSAGE.RES,
            money:player.money,
            item:{
                type:type,
                index:msg.index,
                itemNum:result,
                itemId:itemId
            }
        });
    }


}
function removeItem(msg,player,next){
    var type = msg.type
        ,index = msg.index
        ,itemId = msg.itemId
        ,itemNum = msg.itemNum
        ;
    var checkResult = player.packageEntity.checkItem(type,index,itemId);
    if(!checkResult ){
        next(null,{
            code:code.PACKAGE.NOT_EXIST_ITEM
        });
        return 0;
    }
    if(checkResult < itemNum){
        next(null,{
            code:code.PACKAGE.NOT_ENOUGH_ITEM
        });
        return 0;
    }
    /*
     var item={
     type:type,
     index:index,
     itemNum:itemNum
     }
     //抽出方法
     player.sellItem(item,costMoney);
     */
    if(player.packageEntity.removeItem(type,index,itemNum)){
        return   checkResult-itemNum;
    }
    return  0;
}
handler.discardItem= function(msg, session, next){
    var player = area.getPlayer(session.get('playerId'));
    var result = removeItem(msg,player,next);
    if(!!result){
        next(null,{
            code:consts.MESSAGE.RES,
            item:{
                type:msg.type,
                index:msg.index,
                itemNum:result,
                itemId:msg.itemId
            }
        });
    }
}
