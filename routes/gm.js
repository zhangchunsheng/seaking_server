/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: gm
 */
var gmService = require('../app/services/gmService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 重置任务
 * @param req
 * @param res
 */
exports.resetTask = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("index");
}

/**
 * 更新金币
 * @param req
 * @param res
 */
exports.updateMoney = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("index");
}

/**
 * 更新经验
 * @param req
 * @param res
 */
exports.updateExp = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("index");
}