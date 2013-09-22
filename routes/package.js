/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: package
 */
var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 添加物品
 * @param req
 * @param res
 */
exports.addItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

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
}

/**
 * 丢弃物品
 * @param req
 * @param res
 */
exports.dropItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var type = msg.type;
    var index = msg.index;

    var player = area.getPlayer(session.get('playerId'));

    player.packageEntity.removeItem(type, index);

    next(null, {
        code: consts.MESSAGE.RES,
        status: 1
    });
}

/**
 * 卖出物品
 * @param req
 * @param res
 */
exports.sellItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

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
    if(!itemInfo) {
        next(null, {
            code:code.PACKAGE.NOT_EXIST_ITEM
        });
        return;
    }
    if(!itemInfo.canSell) {
        next(null,{
            code:code.FAIL
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
            code: code.FAIL
        })
    }

    var checkResult = player.packageEntity.checkItem(type, index, itemId);
    if(!checkResult ) {
        next(null,{
            code: code.PACKAGE.NOT_EXIST_ITEM
        });
        return 0;
    }
    if(checkResult < itemNum) {
        next(null,{
            code: code.PACKAGE.NOT_ENOUGH_ITEM
        });
        return 0;
    }
    if(player.packageEntity.removeItem(type, index, itemNum)) {
        return checkResult - itemNum;
    }
    return  0;
}

/**
 * 丢弃物品
 * @param req
 * @param res
 */
exports.discardItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

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
 * 重置背包
 * @param req
 * @param res
 */
exports.resetItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var start = msg.start;
    var end = msg.end;
    var type = msg.type;
    var player = area.getPlayer(session.get('playerId'));
    var startItem  =  player.packageEntity[type].items[start];
    var endItem =  player.packageEntity[type].items[end];
    if(startItem == null) {
        next(null,{
            code: code.FAIL
        });
        return;
    }
    player.packageEntity[type].items[start] = endItem;
    player.packageEntity[type].items[end] = startItem;
    player.packageEntity.save();
    next(null, {
        code:code.OK,
        items:[{
            index: start,
            item: endItem
        },{
            index: end,
            item: startItem
        }]
    });
}

/**
 * 使用道具
 * @param req
 * @param res
 */
exports.userItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var index = msg.index;
    var type = msg.type;

    var player = (area.getPlayer(session.get("playerId")));
    var Item = player.packageEntity[type].items[index];

    if(Item == null) {
        next(null, {
            code: code.FAIL
        });
        return;
    }
    var itemInfo = null;
    if("items" == type) {
        itemInfo = dataApi.item.findById(Item.itemId);
    } else {
        itemInfo = dataApi.equipment.findById(Item.itemId);
    }
    if(player.level < itemInfo.needLevel) {
        next(null, {
            code: code.FAIL
        });
        return;
    }
    logger.debug(itemInfo);
    var ifUser = Item.itemId.substr(1, 2);
    if(consts.ItemType.canNotUser == ifUser) {
        next(null, {
            code: code.FAIL
        });
        return;
    }
    var itemClass = Item.itemId.substr(3, 2);
    var package = player.packageEntity;
    switch(itemClass) {
        case consts.ItemCategory.Increase:
            player.buffs.push({
                useEffectId: itemInfo.useEffectId,
                startTime: new Date().getTime()
            });

            package.removeItem(type, index, 1);
            package.save();
            next(null, {
                code: code.OK
            });
            break;
        case consts.ItemCategory.HPreply://恢复HP
            var hpType = Item.itemId.substr(5, 2);
            switch(hpType) {
                case "01"://直接恢复hp
                    var hpMatch = /([0-9]+)(HP)/ig;
                    hpMatch.exec(itemInfo.effectDescription);
                    var hp = parseInt(RegExp.$1);
                    if(player.hp < player.maxHp) {
                        player.hp += hp;
                    } else {
                        player.hp = player.maxHp;
                    }

                    userDao.updatePlayer(player, "hp", function(err, reply) {
                        package.removeItem(type, index, 1);
                        package.save();
                        next(null, {
                            code: code.OK
                        });
                    });
                    break;
                case "02"://持续恢复hp
                    player.buff.push({
                        useEffectId: itemInfo.useEffectId,
                        startTime: new Date()
                    });
                    package.removeItem(type, index, 1);
                    package.save();
                    next(null, {
                        code: code.OK
                    });
                    break;
            }
            break;
        case consts.ItemCategory.UpgradeMaterial://升级材料
        case consts.ItemCategory.TreasureChest: //设计图纸
        case consts.ItemCategory.Keys://钥匙
            package.removeItem(type,index,1);
            package.save();
            next(null, {
                code:code.OK
            });
            break;
        case consts.ItemCategory.NoAttributeItem://无属性
            break;
        case consts.ItemCategory.TaskItem://任务物品
            break;
        case consts.ItemCategory.Activity://活动物品
            break;
    }
}