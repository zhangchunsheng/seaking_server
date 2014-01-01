/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-24
 * Description: area
 */
var areaService = require('../app/services/areaService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var EntityType = require('../app/consts/consts').EntityType;
var dataApi = require('../app/utils/dataApi');
var area = require('../app/domain/area/area');
var world = require('../app/domain/world');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

exports.getAreaInfo = function(req, res) {
    var msg = req.query;

    var sceneId = msg.sceneId;
    area.getAreaPlayers(sceneId, function(err, results) {
        var entities = [];
        for(var o in results) {
            var obj = JSON.parse(results[o]);
            entities.push(obj.name);
        }
        var data = {
            code: consts.MESSAGE.RES,
            entities: entities
        };
        utils.send(msg, res, data);
    });
}

exports.getAreaPlayers = function(req, res) {
    var msg = req.query;

    var sceneId = msg.sceneId;
    area.getAreaPlayers(sceneId, function(err, results) {
        var entities = [];
        var entity = {};
        var result;
        for(var i in results) {
            result = JSON.parse(results[i]);
            entity = {
                id: i,
                nickname: result.name,
                cId: result.cId,
                level: result.level
            };
            entities.push(entity);
        }
        var data = {
            code: consts.MESSAGE.RES,
            entities: entities
        };
        utils.send(msg, res, data);
    });
}