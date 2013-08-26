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
    var result = player.packageEntity.addItem(player, type, item);

    next(null, {
        code: consts.MESSAGE.RES,
        packageIndex: result.index
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
/*
handler.useItem = function(msg, session, next) {
    var type = msg.type;
    var index = msg.index;

    var player = area.getPlayer(session.get('playerId'));

    var status = player.useItem(type, index);

    next(null, {
        code: consts.MESSAGE.RES,
        status: status
    });
};*/

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
    var itemInfo = {};
    if("items" == type) {
        itemInfo = dataApi.item.findById(itemId);
    } else {
        itemInfo = dataApi.equipment.findById(itemId);
    }
    logger.info(itemInfo);
    if(!itemInfo) {
        next(null, {
            code:code.PACKAGE.NOT_EXIST_ITEM,
            err:"没有该物品",
            route:"area.packageHandler.sellItem"
        });
        return;
    }
    if(!itemInfo.canSell) {
        next(null,{
            code:code.FAIL,
            err:"不能卖",
            route:"area.packageHandler.removeItem"
        })
    }
    var price = itemInfo.price;
    var incomeMoney = price * itemNum;
    var result = removeItem(msg, player, next);
    if(!!result) {
        player.money += incomeMoney;
        player.save();
        next(null,{
            code: consts.MESSAGE.RES,
            money: player.money,
            item: {
                type: type,
                index: msg.index,
                itemNum: result,
                itemId: itemId
            }
        });
    }
}

function removeItem(msg,player,next) {
    var type = msg.type
        ,index = msg.index
        ,itemId = msg.itemId
        ,itemNum = msg.itemNum;
    var itemInfo = {};
    if("items" == type) {
        itemInfo = dataApi.item.findById(itemId);
    } else {
        itemInfo = dataApi.equipment.findById(itemId);
    }
    if(!itemInfo.canDestroy) {
        next(null,{
            code:code.FAIL,
            err:"不能丢弃",
            route:"area.packageHandler.removeItem"
        })
    }

    var checkResult = player.packageEntity.checkItem(type, index, itemId);
    if(!checkResult ) {
        next(null,{
            code:code.PACKAGE.NOT_EXIST_ITEM,
            err:"没有该物品",
            route:"area.packageHandler.removeItem"
        });
        return 0;
    }
    if(checkResult < itemNum) {
        next(null,{
            code:code.PACKAGE.NOT_ENOUGH_ITEM,
            err:"数量不足",
            route:"area.packageHandler.removeItem"
        });
        return 0;
    }
    if(player.packageEntity.removeItem(type, index, itemNum)) {
        return checkResult - itemNum;
    }
    return  0;
}

/**
 * 丢弃
 * @param msg
 * @param session
 * @param next
 */
handler.discardItem = function(msg, session, next) {
    var player = area.getPlayer(session.get('playerId'));
    var result = removeItem(msg, player, next);
    if(!!result) {
        next(null, {
            code:consts.MESSAGE.RES,
            item: {
                type: msg.type,
                index: msg.index,
                itemNum: result,
                itemId: msg.itemId
            }
        });
    }
}

/**
 * 重排位置
 * @param msg
 * @param session
 * @param next
 */
handler.resetItem = function(msg, session, next) {
    var start = msg.start;
    var end = msg.end;
    var type = msg.type;
    var player = area.getPlayer(session.get('playerId'));
    var startItem  =  player.packageEntity[type].items[start];
    var endItem =  player.packageEntity[type].items[end];
    if(startItem == null) {
        next(null,{
            code:code.FAIL,
            err:"没有该物品",
            route:"area.packageHandler.resetItem"
        });
        return;
    }
    player.packageEntity[type].items[start] = endItem;
    player.packageEntity[type].items[end] = startItem;
    player.packageEntity.save();
    next(null, {
        code:code.OK,
        items:[{
            index:start,
            item:endItem
        },{
            index:end,
            item:startItem
        }]
    });
}
handler.userItem = function (msg, session, next) {
    var index = msg.index;
    var type = msg.type;
    var player = (area.getPlayer(session.get("playerId")));
    var Item = player.packageEntity[type].items[index];
    logger.error(player);
    if(Item == null){
        next(null,{
            code:code.FAIL,
            err:"没有该物品",
            route:"area.packageHandler.userItem"
        });
        return;
    }
    var itemInfo = null;
    if("items" == type) {
        itemInfo = dataApi.item.findById(Item.itemId);
    } else {
        itemInfo = dataApi.equipment.findById(Item.itemId);
    }
    if(player.level < itemInfo.needLevel){
        next(null,{
            code:code.FAIL,
            err:"等級不足",
            route:"area.packageHandler.userItem"
        });
        return;
    }
    logger.debug(itemInfo);
    var ifUser = Item.itemId.substr(1,2);
    if(consts.Item.canNotUser == ifUser) {
        next(null,{
            code:code.FAIL,
            err:"物品不能用",
            route:"area.packageHandler.userItem"
        });
        return;
    }
    var itemClass = Item.itemId.substr(3,2);
    var package = player.packageEntity;
    switch(itemClass){
        case consts.Item.Increase:
            //临时属性提高
           // if(player.buffs != null){
                player.buffs.push({useEffectId:itemInfo.useEffectId,startTime:new Date().getTime()});
          //  }else{
          //      player.buffs = [{useEffectId:itemInfo.useEffectId,startTime:new Date()}];
           // }
            logger.info(player.buffs);
            package.removeItem(type,index,1);
            package.save();
            next(null,{
               code:code.OK
            });
            break;
        case consts.Item.HPreply:
            //恢复HP
            var hpType = Item.itemId.substr(5,2);
            switch( hpType){
                case "01":
                    //直接恢复hp
                    var hpMatch = /([0-9]+)(HP)/ig;
                    hpMatch.exec(itemInfo.effectDescription);
                    var hp = parseInt(RegExp.$1);
                    if(player.hp < player.maxHp) {
                        player.hp += hp;
                    }else  {
                        player.hp = player.maxHp;
                    }
                    logger.info("hp:"+player.hp);
                    userDao.updatePlayer(player, "hp", function(err,reply){
                       package.removeItem(type,index,1);
                       package.save();
                       next(null,{
                          code:code.OK
                       });
                    });
                    return;
                break;
                case "02":
                    //持续恢复hp
                    player.buff.push({useEffectId:itemInfo.useEffectId,startTime:new Date()});
                    package.removeItem(type,index,1);
                    package.save();
                    next(null,{
                       code:code.OK
                    });

                break;
            }
            break;
        case consts.Item.UpgradeMaterial:
            //升级材料
            //暂时前端判断

        case consts.Item.TreasureChest:
            //设计图纸

        case consts.Item.Keys:
            //钥匙
            package.removeItem(type,index,1);
            package.save();
            next(null,{
                code:code.OK
            });
            break;
        case consts.Item.NoAttributeItem:
            //无属性
            break;
        case consts.Item.TaskItem:
            //任务物品
            break;
        case consts.Item.Activity:
            //活动物品
            break;
    }
}
