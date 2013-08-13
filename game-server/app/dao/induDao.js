/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-13
 * Description: induDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var consts = require('../consts/consts');
var async = require('async');
var utils = require('../util/utils');
var consts = require('../consts/consts');
var dbUtil = require('../util/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');

var induDao = module.exports;

induDao.getInduInfo = function(serverId, registerType, loginName, induId, cb) {
    var induInfo = dataApi.instancedungeon.findById(induId);
    utils.invokeCallback(cb, null, induInfo);
}

/**
 * 获得怪物组信息
 * @param mgid
 * @param cb
 */
induDao.getInduMonstergroup = function(mgid, cb) {
    var induMonstergroup = dataApi.induMonstergroup.findById(mgid);
    utils.invokeCallback(cb, null, induMonstergroup);
}