/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-20
 * Description: playerHandler
 */
/**
 * Module dependencies
 */

var area = require('../../../domain/area/area');
var messageService = require('../../../domain/messageService');
var timer = require('../../../domain/area/timer');
var world = require('../../../domain/world');
var userDao = require('../../../dao/userDao');
var partnerDao = require('../../../dao/partnerDao');
var actionManager = require('../../../domain/action/actionManager');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var dataApi = require('../../../util/dataApi');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);

var handler = module.exports;

handler.initSkill = function(msg, session, next) {

}