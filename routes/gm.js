/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: gm
 */
var gmService = require('../app/services/gmService');
var userService = require('../app/services/userService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var region = require('../config/region');
var async = require('async');

/**
 * 重置任务
 * @param req
 * @param res
 */
exports.resetTask = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var type = msg.type;
    var taskId = msg.taskId;
    var nickname = msg.nickname;
    var serverId = region.serverId;

    if(typeof type == "undefined" || type == "" || type == 0) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
        return;
    }

    if(typeof nickname == "undefined" || nickname == "" || nickname == 0) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
        return;
    }

    if(taskId) {
        if(taskId.indexOf("Task") != 0) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }
    }

    if(parseInt(type) < 10) {
        type = consts.correspondingCurTaskType[type];
    }

    var data = {};
    userService.getCharacterInfoByNickname(serverId, nickname, function(err, reply) {//S1_T2_w106451_C10212
        if(err) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
            return;
        }

        var registerType = 0;
        var loginName = "";
        var characterId = 0;

        var array = reply.split("_");
        registerType = array[1].replace("T", "");
        loginName = array[2];
        characterId = array[3].replace("C", "");

        userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, character) {
            character.resetTask(type, taskId);

            async.parallel([
                function(callback) {
                    taskService.updateTask(character, character.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                data = {
                    code: Code.OK
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 * 更新金币
 * @param req
 * @param res
 */
exports.updateMoney = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var money = msg.money;
    var nickname = msg.nickname;
    var serverId = region.serverId;

    if(typeof money == "undefined" || money == "" || money == 0) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
        return;
    }

    if(typeof nickname == "undefined" || nickname == "" || nickname == 0) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
        return;
    }

    var data = {};
    userService.getCharacterInfoByNickname(serverId, nickname, function(err, reply) {
        if(err) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
        }

        var registerType = 0;
        var loginName = "";
        var characterId = 0;

        var array = reply.split("_");
        registerType = array[1].replace("T", "");
        loginName = array[2];
        characterId = array[3].replace("C", "");

        userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, character) {
            character.updateMoney(money);

            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(character, callback);
                }
            ], function(err, reply) {
                data = {
                    code: Code.OK
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 * 更新经验
 * @param req
 * @param res
 */
exports.updateExp = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var exp = msg.exp;
    var nickname = msg.nickname;
    var serverId = region.serverId;

    if(typeof exp == "undefined" || exp == "" || exp == 0) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
        return;
    }

    if(typeof nickname == "undefined" || nickname == "" || nickname == 0) {
        data = {
            code: Code.FAIL
        };
        utils.send(msg, res, data);
        return;
    }

    var data = {};
    userService.getCharacterInfoByNickname(serverId, nickname, function(err, reply) {
        if(err) {
            data = {
                code: Code.FAIL
            };
            utils.send(msg, res, data);
        }

        var registerType = 0;
        var loginName = "";
        var characterId = 0;

        var array = reply.split("_");
        registerType = array[1].replace("T", "");
        loginName = array[2];
        characterId = array[3].replace("C", "");

        userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, character) {
            character.updateExp(exp);

            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(character, callback);
                }
            ], function(err, reply) {
                data = {
                    code: Code.OK
                };
                utils.send(msg, res, data);
            });
        });
    });
}