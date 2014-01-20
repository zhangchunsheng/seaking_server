/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: package
 */
var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var PackageType = require('../app/consts/consts').PackageType;
var dataApi = require('../app/utils/dataApi');
var Buff = require('../app/domain/buff');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

exports.test = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;
     userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        item = {itemId: "D10010101", itemNum:3};
        var i = player.packageEntity.addItemWithNoType(player, item);
        utils.send(msg, res, {data:i});

    });
}
/**
 * 添加物品
 * @param req
 * @param res
 */
exports.addItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var itemId = msg.itemId;
    var itemNum = msg.itemNum;
    var itemLevel = msg.itemLevel;

    var data = {};
    if (!itemId.match(/W|E|D|B/)) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION,
            packageIndex: 0
        };
        utils.send(msg, res, data);
        return;
    }
    var type = "";
    if(itemId.indexOf("W") == 0) {
        type = PackageType.WEAPONS;
    } else if(itemId.indexOf("E") == 0) {
        type = PackageType.EQUIPMENTS;
    } else if(itemId.indexOf("D") == 0) {
        type = PackageType.ITEMS;
    } else if(itemId.indexOf("B") == 0) {
        type = PackageType.DIAMOND;
    }

    var item = {
        itemId: itemId,
        itemNum: itemNum,
        level: itemLevel
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var result = player.packageEntity.addItem(player, type, item);

        data = {
            code: consts.MESSAGE.RES,
            packageIndex: result.index
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var type = msg.type;
    var index = msg.index;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.packageEntity.removeItem(type, index);

        data = {
            code: consts.MESSAGE.RES,
            status: 1
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var index = msg.index,
        itemNum = msg.itemNum;
    if(!index || !itemNum) {
        return utils.send(msg, res, {code: Code.FAIL});
    }
    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var itemInfo = {};
        var item = player.packageEntity.get(index);
        if(!item || item.itemNum < itemNum){
            return utils.send(msg, res, {code: Code.FAIL});
        }
        var type = player.packageEntity.getItemType(item);
        var itemId = item.itemId;
        var type;
        if(itemId.indexOf("D") >= 0) {
            type = PackageType.ITEMS;
            itemInfo = dataApi.item.findById(itemId);
        } else if(itemId.indexOf("E") >= 0) {
            type = PackageType.EQUIPMENTS;
            itemInfo = dataApi.equipment.findById(itemId);
        } else if(itemId.indexOf("W") >= 0) {
            type = PackageType.WEAPONS;
            itemInfo = dataApi.weapons.findById(itemId);
        } else if(itemId.indexOf("B") >= 0) {
            type = PackageType.DIAMOND;
            itemInfo = dataApi.diamonds.findById(itemId);
        }
        
        if(!itemInfo) {
            data = {
                code:Code.PACKAGE.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }
        
        /*if(!itemInfo.canSell) {
            data = {
                code:Code.FAIL,
                err: "不能卖"
            };
            utils.send(msg, res, data);
            return;
        }*/
        if(typeof itemInfo.price == "undefined") {
            data = {
                code: Code.SHOP.NOT_EXIST_PRICE
            };
            utils.send(msg, res, data);
            return;
        }
        var price = itemInfo.price / 2;
        console.log(price);
        var incomeMoney = price * itemNum;
        var result = removeItem(req, res, msg, player);
        if(!!result) {
            player.money += incomeMoney;
            player.save();

            data = {
                code: consts.MESSAGE.RES,
                data:{
                    money: player.money,
                    packageChange: result
                }
                
                //,itemInfo: itemInfo
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
                /*if(err){utils.send(msg, res, {
                    code: Code.FAIL,
                    err: err
                });return;}*/
            console.log(err);
                utils.send(msg, res, data);
            });
        }else{
            utils.send(msg, res, {code: code.FAIL});
        }
    });
}

function removeItem(req, res, msg, player) {
    var index = msg.index
        ,itemNum = msg.itemNum;
    var itemInfo = {};
    var data = {};

    var checkResult = player.packageEntity.checkItem( index);
    if(!checkResult ) {
        data = {
            code: Code.PACKAGE.NOT_EXIST_ITEM
        };
        utils.send(msg, res, data);
        return 0;
    }
    if(checkResult < itemNum) {
        data = {
            code: Code.PACKAGE.NOT_ENOUGH_ITEM
        };
        utils.send(msg, res, data);
        return 0;
    }
    if(item = player.packageEntity.removeItem( index, itemNum)) {
        return item;
    }
    return  null;
}

/**
 * 丢弃物品
 * @param req
 * @param res
 */
exports.discardItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var result = removeItem(req, res, msg, player);
        if(result >= 0) {
            data = {
                code:consts.MESSAGE.RES,
                data: {
                    index: msg.index,
                    itemNum: result,
                    itemId: msg.itemId
                }
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var startItem  =  player.packageEntity.items[start];
        var endItem =  player.packageEntity.items[end];
        if(startItem == null) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }
        player.packageEntity.items[start] = endItem;
        player.packageEntity.items[end] = startItem;
        player.packageEntity.save();
        data = {
            code:Code.OK,
            data:[{
                index: start,
                item: endItem
            },{
                index: end,
                item: startItem
            }]
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var index = msg.index;
    var type = msg.type;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var Item = player.packageEntity[type].items[index];

        if(Item == null) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }
        var itemInfo = null;
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
        } else if(itemId.indexOf("B") >= 0){
            type = PackageType.DIAMOND;
            itemInfo = dataApi.diamonds.findById(itemId);
        }
        if(player.level < itemInfo.needLevel) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }

        var ifUser = Item.itemId.substr(1, 2);
        if(consts.ItemType.canNotUser == ifUser) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }
        var itemClass = Item.itemId.substr(3, 2);
        var package = player.packageEntity;
        switch(itemClass) {
            case consts.ItemCategory.Increase:
                var buff = new Buff({
                    useEffectId: itemInfo.useEffectId,
                    startTime: new Date().getTime()
                });
                player.buffs.push(buff);

                package.removeItem(type, index, 1);
                package.save();

                data = {
                    code: Code.OK
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

                        userService.updatePlayer(player, "hp", function(err, reply) {
                            package.removeItem(type, index, 1);
                            package.save();
                            data = {
                                code: Code.OK
                            };
                            async.parallel([
                                function(callback) {
                                    packageService.update(player.packageEntity.strip(), callback);
                                },
                                function(callback) {
                                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                                }
                            ], function(err, reply) {
                                utils.send(msg, res, data);
                            });
                        });
                        break;
                    case "02"://持续恢复hp
                        var buff = new Buff({
                            useEffectId: itemInfo.useEffectId,
                            startTime: new Date().getTime()
                        });
                        player.buffs.push(buff);
                        package.removeItem(type, index, 1);
                        package.save();
                        data = {
                            code: Code.OK
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
                        break;
                }
                break;
            case consts.ItemCategory.UpgradeMaterial://升级材料
            case consts.ItemCategory.TreasureChest: //设计图纸
            case consts.ItemCategory.Keys://钥匙
                package.removeItem(type,index,1);
                package.save();
                data = {
                    code:Code.OK
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
                break;
            case consts.ItemCategory.NoAttributeItem://无属性
                break;
            case consts.ItemCategory.TaskItem://任务物品
                break;
            case consts.ItemCategory.Activity://活动物品
                break;
        }
    });
}

exports._Set = function(req, res) {
    var msg = req.query;
    var session = req.session;
       var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
     userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var package = player.packageEntity;
        package.itemCount = msg.itemCount;
        package.items = JSON.parse(msg.items);
        package.save();
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
                utils.send(msg, res, {code: Code.OK, data:msg.items});
            });
     });
}

/**
 * 整理背包
 * @param req
 * @param res
 */
exports.arrange = function(req, res) {
    var msg = req.query;
    var session = req.session;
       var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var package = player.packageEntity;
        package.arrange(function(err, r) {
            if(err) {
                utils.send(msg, res, {
                    code: Code.FAIL
                });
                return;
            }
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
                utils.send(msg, res,{code: Code.OK, data: r});
            });
        });
    });
}

exports.unlock = function(req, res) {
    var msg = req.query;
    var end = msg.end;
    var session = req.session;
       var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    if(end <= 0) {
        return utils.send(msg, res , {
            code: Code.FAIL,
            err: "参数有点问题"
        })
    }
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
     userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
         var items =  player.packageEntity;
         var costMoney = 0, costGameCurrency =0;
         if(end < 32) {
            costMoney = (32 - items.itemCount)*(2000*(items.itemCount+1-16)+2000*(end-16))/2;
         } else if(end <= 64 &&end >= 32 && items.itemCount <= 32 ) {
            costMoney = (32 - items.itemCount) * (2000*(items.itemCount -16 +1)+2000*(32-16))/2;
            costGameCurrency = (end - 32)*((end-32)+1)/2;
         }else if(items.itemCount >= 32 && end <= 64 ){
             costGameCurrency = (end-items.itemCount)*((end-32)+(items.itemCount-32+1))/2;
         }else{
            return utils.send(msg, res, {
                code: Code.FAIL
            });
         }
         if(player.money < costMoney || player.gameCurrency < costGameCurrency) {
            utils.send(msg, res, {
                code: Code.FAIL,
                err: "没钱"
            });
             return;
         }
         player.money = player.money - costMoney;
         player.gameCurrency = player.gameCurrency - costGameCurrency;
         player.packageEntity.unlock( end);
         player.save();
         var data = {
            code: consts.MESSAGE.RES,
            data:{
                money: player.money,
                gameCurrency: player.gameCurrency
                ,itemCount: end
            }
            
         }
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
         
     });
}