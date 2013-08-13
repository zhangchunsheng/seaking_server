/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: messageService
 */
var pomelo = require('pomelo');
var area = require('./area/area');
var timer = require('./area/timer');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType = require('../consts/consts').EntityType;

var exp = module.exports;

exp.pushMessage = function (route, msg, cb) {
    area.channel().pushMessage(route, msg, errHandler);
};

exp.pushMessageByUids = function (uids, route, msg) {
    pomelo.app.get('channelService').pushMessageByUids(route, msg, uids, errHandler);
};

exp.pushMessageToPlayer = function (uid, route, msg) {
    exp.pushMessageByUids([uid], route, msg);
};

exp.pushMessageByAOI = function (msg, pos, ignoreList) {
    var uids = timer.getWatcherUids(pos, [EntityType.PLAYER], ignoreList);

    if (uids.length > 0) {
        exp.pushMessageByUids(uids, msg.route, msg);
    }
};

function errHandler(err, fails){
    if(!!err){
        logger.error('Push Message error! %j', err.stack);
    }
    if(!!fails && fails.length > 0){
        for(var i = 0; i < fails.length; i++){
            area.removePlayerByUid(fails[i]);
        }
    }
}