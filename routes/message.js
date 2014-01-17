/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-28
 * Description: message
 */
var messageService = require('../app/services/messageService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var session = require('../app/http/session');
var region = require('../config/region');
var EntityType = require('../app/consts/consts').EntityTyp
var consts = require('../app/consts/consts');

exports.index = function(req, res) {
    res.send("index");
}

/**
 *
 * @param req
 * @param res
 */
exports.addMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , type = msg.type
        , message = msg.message;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var date = new Date();
    var message = {
        type: type,
        message: message,
        date: date.getTime()
    };
    var data = {};
    messageService.addMessage(serverId, registerType, loginName, characterId, message, function(err, reply) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.getMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    messageService.getMessage(serverId, registerType, loginName, characterId, function(err, reply) {
        data = {
            code: Code.OK,
            message: reply
        };
        utils.send(msg, res, data);
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.removeMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    messageService.removeMessage(serverId, registerType, loginName, characterId, function(err, reply) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}

exports.addTipMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , type = msg.type
        , num = msg.num;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var message = {
        type: type,
        num: num
    };
    var data = {};
    messageService.addTipMessage(serverId, registerType, loginName, characterId, message, function(err, reply) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}

exports.getTipMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    messageService.getTipMessage(serverId, registerType, loginName, characterId, function(err, reply) {
        data = {
            code: Code.OK,
            message: reply
        };
        utils.send(msg, res, data);
    });
}

exports.removeTipMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    messageService.removeTipMessage(serverId, registerType, loginName, characterId, function(err, reply) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}

exports.addBattleReport = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , battleInfo = msg.battleInfo;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var date = new Date();
    var battleReport = {
        battleInfo: JSON.parse(battleInfo),
        date: date.getTime()
    };
    var data = {};
    messageService.addBattleReport(serverId, registerType, loginName, characterId, battleReport, function(err, reply) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.getBattleReport = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    messageService.getBattleReport(serverId, registerType, loginName, characterId, function(err, reply) {
        data = {
            code: Code.OK,
            battleReports: reply
        };
        utils.send(msg, res, data);
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.removeBattleReport = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    messageService.removeBattleReport(serverId, registerType, loginName, characterId, function(err, reply) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.publishMessage = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var date = new Date();
    var message = {
        type: consts.publishMessageType.TIP_MESSAGE,
        message: "html5战胜了，获得奖励",
        date: date.getTime()
    };
    var data = {};
    messageService.publishMessage(JSON.stringify(message), function(data) {
        data = {
            code: Code.OK
        };
        utils.send(msg, res, data);
    });
}