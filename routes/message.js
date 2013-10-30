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
    var message = {

    };
}

/**
 *
 * @param req
 * @param res
 */
exports.getMessage = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.getBattleReport = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.removeBattleReport = function(req, res) {

}

/**
 *
 * @param req
 * @param res
 */
exports.removeMessage = function(req, res) {

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
        type: consts.pushMessageType.TIP_MESSAGE,
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