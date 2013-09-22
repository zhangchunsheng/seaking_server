/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-28
 * Description: index
 */
var Code = require('../shared/code');
var utils = require('../app/utils/utils');

exports.index = function(req, res) {
    console.log(req);
    console.log(res);
    res.send("hello world");
}