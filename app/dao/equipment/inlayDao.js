/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-01-04
 * Description: inlayDao
 */
var dataApi = require('../../utils/dataApi');
var Player = require('../../domain/entity/player');
var User = require('../../domain/user');
var consts = require('../../consts/consts');
var equipmentsDao = require('../equipmentsDao');
var skillDao = require('../skillDao');
var async = require('async');
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var buffUtil = require('../../utils/buffUtil');
var partnerUtil = require('../../utils/partnerUtil');
var message = require('../../i18n/zh_CN.json');
var formula = require('../../consts/formula');
var Skills = require('../../domain/skill/skills');

var redis = require('../../dao/redis/redis')
    , redisConfig = require('../../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var inlayDao = module.exports;