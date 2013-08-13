/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: channelUtil
 */
var crc = require('crc');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports.dispatch = function(uid, connectors) {
    var index = Number(uid) % connectors.length;
    return connectors[index];
};
