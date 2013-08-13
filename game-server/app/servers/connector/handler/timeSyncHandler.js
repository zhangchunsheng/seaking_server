/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: timeSyncHandler
 */
var consts = require('../../../consts/consts');
var handler = module.exports;

handler.timeSync = function(msg, session, next) {
    next(null, {code: consts.MESSAGE.RES});
};