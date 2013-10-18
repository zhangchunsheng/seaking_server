/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-17
 * Description: ucenter
 */
var ucenterConfig = require('../../../shared/config/ucenter');
var httpHelper = require('../http/httpHelper');

var env = process.env.NODE_ENV || 'development';
if(ucenterConfig[env]) {
    ucenterConfig = ucenterConfig[env];
}

var ucenter = module.exports;

ucenter.saveInduLog = function(data) {
    var host = ucenterConfig.host;
    var port = ucenterConfig.port;
    var path = "/induLog/save";
    var headers = {};

    data.induData = JSON.stringify(data.induData);

    httpHelper.post(host, port, path, headers, {}, data, function() {

    });
}

ucenter.saveTaskLog = function(data) {
    var host = ucenterConfig.host;
    var port = ucenterConfig.port;
    var path = "/taskLog/save";
    var headers = {};

    data.taskRecord = JSON.stringify(data.taskRecord);

    httpHelper.post(host, port, path, headers, {}, data, function() {

    });
}

ucenter.saveBattleLog = function(data) {
    var host = ucenterConfig.host;
    var port = ucenterConfig.port;
    var path = "/battleLog/save";
    var headers = {};

    httpHelper.post(host, port, path, headers, {}, data, function() {

    });
}

ucenter.addPlayer = function(data) {
    var host = ucenterConfig.host;
    var port = ucenterConfig.port;
    var path = "/user/addPlayer";
    var headers = {};

    httpHelper.get(host, port, path, headers, data, function() {

    });
}

ucenter.updatePlayer = function(data) {
    var host = ucenterConfig.host;
    var port = ucenterConfig.port;
    var path = "/user/updatePlayer";
    var headers = {};

    httpHelper.get(host, port, path, headers, data, function() {

    });
}

ucenter.removePlayer = function(data) {
    var host = ucenterConfig.host;
    var port = ucenterConfig.port;
    var path = "/user/removePlayer";
    var headers = {};

    httpHelper.get(host, port, path, headers, data, function() {

    });
}