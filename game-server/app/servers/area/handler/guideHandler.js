/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-01
 * Description: guideHandler
 */
var area = require('../../../domain/area/area');
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var playerDao = require('../../../dao/playerDao');
var battleDao = require('../../../dao/battleDao');
var async = require('async');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var formula = require('../../../consts/formula');
var Player = require('../../../domain/entity/player');
var Monster = require('../../../domain/entity/monster');
var EntityType = require('../../../consts/consts').EntityType;
var Fight = require('../../../domain/battle/fight');
var consts = require('../../../consts/consts');

var handler = module.exports;

/**
 * 获得新手引导进度
 */
handler.get = function() {

}

/**
 * 保存新手引导进度
 */
handler.save = function() {

}