/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-19
 * Description: equipmentUtil
 */
var consts = require('../consts/constsV2');
var EntityType = require('../consts/consts').EntityType;
var formulaV2 = require('../consts/formulaV2');
var utils = require('./utils');
var dataApi = require('./dataApi');

var equipmentUtil = module.exports;

equipmentUtil.initInlay = function() {
    return {
        count: 6,
        diamonds: {

        }
    }
}