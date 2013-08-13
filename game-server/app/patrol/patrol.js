/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: patrol
 */
var PatrolManager = require('./service/patrolManager');
var exp = module.exports;

exp.RES_FINISH = 0;
exp.RES_WAIT = 1;

exp.createManager = function() {
    return new PatrolManager();
};