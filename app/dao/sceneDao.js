/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-13
 * Description: sceneDao
 */
var dataApi = require('../utils/dataApi');
var consts = require('../consts/consts');
var async = require('async');
var utils = require('../utils/utils');
var consts = require('../consts/consts');
var dbUtil = require('../utils/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var userDao = require('./userDao');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var sceneDao = module.exports;

sceneDao.getSceneInfo = function() {

}