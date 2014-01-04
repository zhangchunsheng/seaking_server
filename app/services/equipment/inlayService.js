/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-01-04
 * Description: inlayService
 */
var utils = require('../../utils/utils');
var dbUtil = require('../../utils/dbUtil');
var redisService = require('../redisService');
var inlayDao = require('../../dao/character/inlayDao');

var inlayService = module.exports;