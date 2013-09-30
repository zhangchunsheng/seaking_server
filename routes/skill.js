/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: skill
 */
var skillService = require('../app/services/skillService');
var userService = require('../app/services/userService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * initSkill
 * @param req
 * @param res
 */
exports.initSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var cId = msg.cId;
    skillService.initSkill();
    res.send("index");
}