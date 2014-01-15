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
                code: Code.FORMATION.NO_TACTICAL
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
                code: Code.FORMATION.NO_TACTICAL
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

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        //验证tacticalId
        var result = player.formationEntity.hasTacticalId(player, tacticalId);
        if(result == 0) {
            data = {
                code: Code.FORMATION.NO_TACTICAL
            };
            utils.send(msg, res, data);
            return;
        }

        var array = [];
        formationService.upgradeTactical(array, player, tacticalId, function(err, reply) {
            data = {
                code: consts.MESSAGE.RES,
                level: reply
            };
            utils.send(msg, res, data);
        });
    });
}