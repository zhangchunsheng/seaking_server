/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: role
 */
var roleService = require('../app/services/roleService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var packageService = require('../app/services/packageService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * createMainPlayer
 * @param req
 * @param res
 */
exports.createMainPlayer = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , registerType = session.registerType
        , loginName = session.loginName
        , cId = msg.cId // cId characterId
        , nickname = msg.nickname
        , isRandom = msg.isRandom;// 随机获得昵称
    var self = this;

    var serverId = session.serverId;

    var data = {};
    roleService.is_exists_nickname(serverId, nickname, function(err, flag) {
        if(flag) {
            data = {code: consts.MESSAGE.ERR};
            utils.send(msg, res, data);
            return;
        }

        userService.createCharacter(serverId, uid, registerType, loginName, cId, nickname, function(err, character) {
            if(err) {
                console.log('[register] fail to invoke createPlayer for ' + err.stack);
                data = {code: consts.MESSAGE.ERR, error:err};
                utils.send(msg, res, data);
                return;
            } else {
                var array = [
                    function(callback) {// 初始化武器
                        equipmentsService.createEquipments(character.id, callback);
                    },
                    function(callback) {// 初始化装备
                        packageService.createPackage(character.id, callback);
                    },
                    function(callback) {
                        var skillId = 1;
                        character.learnSkill(skillId, callback);
                    }
                ];
                async.parallel(array,
                    function(err, results) {
                        if (err) {
                            console.log('learn skill error with player: ' + JSON.stringify(character.strip()) + ' stack: ' + err.stack);
                            data = {code: consts.MESSAGE.ERR, error:err};
                            utils.send(msg, res, data);
                            return;
                        }

                        var user = {
                            id: uid
                        };

                        req.session.playerId = character.id;

                        data = {
                            code: consts.MESSAGE.RES,
                            user: user,
                            player: character.strip()
                        };
                        console.log(data);
                        utils.send(msg, res, data);
                    }
                );
            }
        });
    });
}

/**
 * 获得角色信息
 * @param req
 * @param res
 */
exports.getMainPlayer = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , registerType = session.registerType
        , loginName = session.loginName
        , serverId = session.serverId;

    var data = {};
    userService.getCharactersByLoginName(serverId, registerType, loginName, function(err, results) {
        if (err) {
            console.log('learn skill error with player: ' + JSON.stringify(results) + ' stack: ' + err.stack);
            data = {code: consts.MESSAGE.ERR, error:err};
            utils.send(msg, res, data);
            return;
        }

        if(results[0] == null || results[0] == {}) {
            data = {
                code: Code.ENTRY.NO_CHARACTER,
                player: null
            };
        } else {
            data = {
                code: consts.MESSAGE.RES,
                player: results[0].strip()
            };
        }

        console.log(data);
        utils.send(msg, res, data);
    });
}