/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: guide
 */
var guideService = require('../app/services/guideService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 获得进度
 * @param req
 * @param res
 */
exports.get = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("index");
}

/**
 * 保存进度
 * @param req
 * @param res
 */
exports.save = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("index");
}