/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: auth_required
 */
var utils = require('../app/utils/utils');
var Code = require('../shared/code');

module.exports = function (req, res, next) {
    var msg = req.query;

    if (req.session.uid) {
        return next();
    }

    var accept = req.headers.accept || '';
    var data = {};
    // html
    if (~accept.indexOf('json')) {
        res.statusCode = 403;
        data = {
            code: 403
        }
        utils.send(msg, res, data);
    } else {
        data = {
            code: Code.NO_LOGIN
        }
        utils.send(msg, res, data);
    }
};