/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: serverList，数据保存在内存中
 */
var util = require('util');

/**
 * Initialize a new 'serverList' with the given 'opts'
 * serverList inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var ServerList = function(opts) {
    this.id = opts.id;
    this.name = opts.name;
    this.ip = opts.ip;
    this.port = opts.port;
    this.connectNumber = opts.connectNumber;
    this.connectors = opts.connectors;
    this.date = opts.date;
    this.showName = opts.showName;
    this.bz = opts.bz;
    this.updateBz = opts.updateBz;
};

module.exports = ServerList;