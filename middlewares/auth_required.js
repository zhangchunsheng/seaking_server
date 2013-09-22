/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: auth_required
 */
module.exports = function (req, res, next) {
    if (req.session.uid) {
        return next();
    }

    var accept = req.headers.accept || '';
    // html
    if (~accept.indexOf('json')) {
        res.statusCode = 403;
        res.send({
            err: 'forbidden'
        });
    } else {
        res.send({
            err: 'noLogin'
        });
    }
};