/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-30
 * Description: logUtil
 */
var logs = require('../../config/logs');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var logUtil = module.exports;

logUtil.info = function(logger, session, msg) {
    var info = "";

    var key = logUtil.getKey(msg.__route__);
    info = "key=" + key;

    info += logUtil.logUserInfo(session);
    info += logUtil.logParamInfo(msg);

    info += " ";

    info += logUtil.getRemoteAddress(session);

    logger.info(info);
}

logUtil.getKey = function(route) {
    var array = route.split(".");
    var key = "";
    key = logs[array[0]][array[1]][array[2]].key;
    return key;
}

logUtil.logUserInfo = function(session) {
    var info = "";
    var userInfo = {
        uid: session.uid,
        serverId: session.get("serverId"),
        registerType: session.get("registerType"),
        loginName: session.get("loginName"),
        areaId: session.get("areaId"),
        playername: session.get("playername"),
        playerId: session.get('playerId')
    };
    for(var o in userInfo) {
        info += "&" + o + "=" + userInfo[o];
    }
    return info;
}

logUtil.logParamInfo = function(msg) {
    var paramInfo = "";
    var array = [];
    var server = "";
    var handler = "";
    var method = "";

    for(var o in msg) {
        if(o == "__route__") {
            array = msg[o].split(".");
            server = array[0];
            handler = array[1];
            method = array[2];

            paramInfo += "&server=" + server;
            paramInfo += "&handler=" + handler;
            paramInfo += "&method=" + method;
        } else {
            paramInfo += "&" + o + "=" + msg[o];
        }
    }
    return paramInfo;
}

/**
 * getRemoteAddress
 * @param session
 */
logUtil.getRemoteAddress = function(session) {
    var ip = session.get("ip");
    return ip;
}