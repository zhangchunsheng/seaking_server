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
    var host = "192.168.1.99";
    var port = "8090";
    var path = "/induLog/save";
    var headers = {};

    data.induData = JSON.stringify(data.induData);

    httpHelper.post(host, port, path, headers, {}, data, function() {

    });
}

ucenter.saveTaskLog = function(data) {
    var host = "192.168.1.99";
    var port = "8090";
    var path = "/taskLog/save";
    var headers = {};

    data.taskRecord = JSON.stringify(data.taskRecord);

    httpHelper.post(host, port, path, headers, {}, data, function() {

    });
}

ucenter.saveBattleLog = function(data) {
    var host = "192.168.1.99";
    var port = "8090";
    var path = "/battleLog/save";
    var headers = {};

    httpHelper.post(host, port, path, headers, {}, data, function() {

    });
}