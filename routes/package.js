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
var async = require('async');

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
    if (!itemId.match(/W|E|D/)) {
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

    var type = msg.type,
        itemId = msg.itemId,
        itemNum = msg.itemNum;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var itemInfo = {};
        if("items" == type) {
            itemInfo = dataApi.item.findById(itemId);
        } else {
            itemInfo = dataApi.equipment.findById(itemId);
        }
        if(!itemInfo) {
            data = {
                code:Code.PACKAGE.NOT_EXIST_ITEM
            };
            utils.send(msg, res, data);
            return;
        }
        if(!itemInfo.canSell) {
            data = {
                code:Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }
        var price = itemInfo.price;
        var incomeMoney = price * itemNum;
        var result = removeItem(req, res, msg, player);
        if(!!result) {
            player.money += incomeMoney;
            player.save();
            data = {
                code: consts.MESSAGE.RES,
                money: player.money,
                item: {
                    type: type,
                    index: msg.index,
                    itemNum: result,
                    itemId: itemId
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

function removeItem(req, res, msg, player) {
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

    var data = {};
    if(!itemInfo.canDestroy) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
    }

    var checkResult = player.packageEntity.checkItem(type, index, itemId);
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

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var result = removeItem(req, res, msg, player);
        if(!!result) {
            data = {
                code:consts.MESSAGE.RES,
                item: {
                    type: msg.type,
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
    var type = msg.type;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var startItem  =  player.packageEntity[type].items[start];
        var endItem =  player.packageEntity[type].items[end];
        if(startItem == null) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }
        player.packageEntity[type].items[start] = endItem;
        player.packageEntity[type].items[end] = startItem;
        player.packageEntity.save();
        data = {
            code:Code.OK,
            items:[{
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
        if("items" == type) {
            itemInfo = dataApi.item.findById(Item.itemId);
        } else {
            itemInfo = dataApi.equipment.findById(Item.itemId);
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
                player.buffs.push({
                    useEffectId: itemInfo.useEffectId,
                    startTime: new Date().getTime()
                });

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
                        player.buffs.push({
                            useEffectId: itemInfo.useEffectId,
                            startTime: new Date()
                        });
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