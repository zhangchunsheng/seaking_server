/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: resource
 */
var resourceService = require('../app/services/resourceService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var fs = require("fs");
var dataApi = require('../app/utils/dataApi');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * Get file'version
 *
 * @param {String} path, file path
 * @return {Number}
 * @api private
 */
var _getFileVersion = function(path) {
    return (new Date(fs.statSync(path).mtime)).getTime();
};

var version = {
    skillList: _getFileVersion('./config/data/skillList.json'),
    equipment:  _getFileVersion('./config/data/equipment.json'),
    item: _getFileVersion('./config/data/item.json'),
    character: _getFileVersion('./config/data/character.json'),
    npc: _getFileVersion('./config/data/npc.json')
};

/**
 * loadResource
 * @param req
 * @param res
 */
exports.loadResource = function(req, res) {
    var msg = req.query;
    var session = req.session;

    console.log("loadResource");
    var data = {};
    if (msg.version.skillList !== version.skillList) {
        data.skillList = dataApi.skillList.all();
    }
    if (msg.version.equipment !== version.equipment) {
        data.equipment = dataApi.equipment.all();
    }
    if (msg.version.item !== version.item) {
        data.item = dataApi.item.all();
    }
    if (msg.version.character !== version.character) {
        data.character = dataApi.character.all();
    }
    if (msg.version.npc !== version.npc) {
        data.npc = dataApi.npc.all();
    }

    var result = {
        data: data,
        version: version
    };
    utils.send(msg, res, result);
}