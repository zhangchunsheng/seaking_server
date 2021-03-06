/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: formation
 */
var formationService = require('../app/services/formationService');
var userService = require('../app/services/userService');
var playerService = require('../app/services/playerService');
var packageService = require('../app/services/packageService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var dataApi = require('../app/utils/dataApi');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 更改阵型
 * @param req
 * @param res
 */
exports.change = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , formation = msg.formation;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    if(!formation) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    try {
        formation = JSON.parse(formation);
    } catch(e) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //验证formation
        var result = player.formationEntity.checkFormation(player, formation);
        if(result == 0) {
            data = {
                code: consts.MESSAGE.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }

        var array = [];
        formationService.changeFormation(array, player, formation, function(err, reply) {
            //更新任务
            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = {
                code: consts.MESSAGE.RES,
                //formation: player.formationEntity.formation.formation
                formation: player.formationEntity.getAbbreviation().f.f
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 默认阵型
 * @param req
 * @param res
 */
exports.setDefault = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , formation = msg.formation
        , tacticalId = msg.tacticalId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    if(!formation) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    if(utils.empty(tacticalId)) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    if(tacticalId.indexOf("F") != 0) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    var tactical =  dataApi.formations.findById(tacticalId);
    if(!tactical) {
        data = {
            code: Code.FORMATION.WRONG_TACTICALID
        };
        utils.send(msg, res, data);
        return;
    }

    try {
        formation = JSON.parse(formation);
    } catch(e) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //验证formation
        var result = player.formationEntity.checkFormation(player, formation);
        if(result == 0) {
            data = {
                code: consts.MESSAGE.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }
        result = player.formationEntity.checkTacticalId(player, tacticalId);
        if(result == 0) {
            data = {
                code: Code.FORMATION.NOOPEN_TACTICAL
            };
            utils.send(msg, res, data);
            return;
        }

        var array = [];
        formationService.setDefault(array, player, formation, tacticalId, function(err, reply) {
            //更新任务
            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = {
                code: consts.MESSAGE.RES,
                //formation: player.formationEntity.formation
                f: player.formationEntity.getAbbreviation().f
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 重置阵型
 * @param req
 * @param res
 */
exports.resetFormation = function(req, res) {
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
        var array = [];
        var formation = player.formationEntity.lastFormation;

        formationService.resetFormation(array, player, formation, function(err, reply) {
            //更新任务
            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = {
                code: consts.MESSAGE.RES,
                //formation: player.formationEntity.formation
                f: player.formationEntity.getAbbreviation().f
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 开锁
 * @param req
 * @param res
 */
exports.unlock = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , formationId = msg.positionId;

    var mtype = msg.mtype;// 金币类型 1 - 金币 2 - 元宝
    if(utils.empty(mtype)) {
        mtype = 0;
    }
    if(utils.empty(formationId)) {
        formationId = msg.formationId;
    }

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    if(!utils.validIntNum(formationId)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    if(formationId < 1 || formationId > 7) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var array = [];
        var result = player.formationEntity.checkUnlock(player, formationId);
        if(result == -1) {
            data = {
                code: Code.FORMATION.NOMORE_POSITION
            };
            utils.send(msg, res, data);
            return;
        }
        if(result == -2) {
            data = {
                code: Code.FORMATION.EXISTS_POSITION
            };
            utils.send(msg, res, data);
            return;
        }
        var gameCurrency = player.gameCurrency;
        if(result == 0) {//元宝
            if(mtype == 2) {
                if(gameCurrency >= 20) {
                    gameCurrency -= 20;
                    player.gameCurrency = gameCurrency;

                    formationService.unlock(array, player, result, formationId, function(err, reply) {
                        data = {
                            code: consts.MESSAGE.RES,
                            mtype: mtype,
                            gameCurrency: player.gameCurrency,
                            //formation: player.formationEntity.formation
                            pushMessage: reply
                        };
                        utils.send(msg, res, data);
                    });
                } else {
                    data = {
                        code: Code.SHOP.NOT_ENOUGHT_GAMECURRENCY
                    };
                    utils.send(msg, res, data);
                    return;
                }
            } else {
                data = {
                    code: Code.FORMATION.NOT_ENOUGH_LEVEL
                };
                utils.send(msg, res, data);
                return;
            }
        } else {
            if(mtype == 2) {
                mtype = 0;
            }
            formationService.unlock(array, player, result, formationId, function(err, reply) {
                data = {
                    code: consts.MESSAGE.RES,
                    mtype: mtype,
                    //formation: player.formationEntity.formation
                    pushMessage: reply
                };
                utils.send(msg, res, data);
            });
        }
    });
}

/**
 * 最强攻击阵型
 * @param req
 * @param res
 */
exports.forteAttack = function(req, res) {
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
        var formation = {
            1: "S1C1",
            2: "S1C1P4"
        };
        var array = [];
        formationService.changeFormation(array, player, formation, function(err, reply) {
            //更新任务
            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = {
                code: consts.MESSAGE.RES,
                //formation: player.formationEntity.formation.formation
                formation: player.formationEntity.getAbbreviation().f.f
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 最强防御阵型
 * @param req
 * @param res
 */
exports.forteDefense = function(req, res) {
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
        var formation = {
            1: "S1C1",
            2: "S1C1P4"
        };
        var array = [];
        formationService.changeFormation(array, player, formation, function(err, reply) {
            //更新任务
            player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

            data = {
                code: consts.MESSAGE.RES,
                //formation: player.formationEntity.formation.formation
                formation: player.formationEntity.getAbbreviation().f.f
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 设置阵法
 * @param req
 * @param res
 */
exports.setTactical = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , tacticalId = msg.tacticalId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};

    if(utils.empty(tacticalId)) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }
    if(tacticalId.indexOf("F") != 0) {
        data = {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    var tactical =  dataApi.formations.findById(tacticalId);
    if(!tactical) {
        data = {
            code: Code.FORMATION.WRONG_TACTICALID
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //验证tacticalId
        var result = player.formationEntity.checkTacticalId(player, tacticalId);
        if(result == 0) {
            data = {
                code: Code.FORMATION.NOOPEN_TACTICAL
            };
            utils.send(msg, res, data);
            return;
        }

        if(result == 2) {
            data = {
                code: Code.OK,
                tacticalId: tacticalId
            };
            utils.send(msg, res, data);
            return;
        }

        var array = [];
        formationService.setTactical(array, player, tacticalId, function(err, reply) {
            data = {
                code: consts.MESSAGE.RES,
                tacticalId: tacticalId
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 升级阵法
 * @param req
 * @param res
 */
exports.upgradeTactical = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , tacticalId = msg.tacticalId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};

    var tactical = dataApi.formations.findById(tacticalId);

    if(utils.empty(tactical)) {
        data = {
            code: Code.FORMATION.NO_TACTICAL_DATA
        };
        utils.send(msg, res, data);
        return;
    }

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //验证tacticalId
        var result = player.formationEntity.hasTacticalId(player, tacticalId);
        if(result == 0) {
            data = {
                code: Code.FORMATION.NOOPEN_TACTICAL
            };
            utils.send(msg, res, data);
            return;
        }

        var level = player.formationEntity.getTacticalLevel(tacticalId);
        var upgradeMaterial = tactical.upgradeMaterial;

        var status = player.formationEntity.checkUpgradeTacticalRequired(player, level, upgradeMaterial);
        if(status == -1) {
            data = {
                code: Code.FORMATION.LACK_UPGRADEMATERIAL
            };
            utils.send(msg, res, data);
            return;
        }
        if(status == -3) {
            data = {
                code: Code.FORMATION.LACK_UPGRADEMONEY
            };
            utils.send(msg, res, data);
            return;
        }

        //packageInfo
        var packageInfo = status.packageInfo;
        var packageIndex = [];
        var item;
        for(var i = 0 ; i < packageInfo.length ; i++) {
            for(var j = 0 ; j < packageInfo[i].length ; j++) {
                item = player.packageEntity.removeItem(packageInfo[i][j].index, packageInfo[i][j].itemNum);
                packageIndex.push({
                    index: packageInfo[i][j].index,
                    itemId: item.itemId,
                    itemNum: item.itemNum
                });
            }
        }
        if(packageIndex.length == 0) {
            packageIndex = 0;
        }

        var money = status.money;
        player.money = player.money - money;

        var array = [];
        userService.getUpdatePlayerAttributeArray(array, player);
        packageService.getUpdateArray(array, player.packageEntity.strip());
        formationService.upgradeTactical(array, player, tacticalId, function(err, reply) {
            data = {
                code: consts.MESSAGE.RES,
                level: reply,
                packageIndex: packageIndex,
                money: player.money
            };
            utils.send(msg, res, data);
        });
    });
}