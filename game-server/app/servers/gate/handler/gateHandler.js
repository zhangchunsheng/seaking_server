/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: gateHandler
 */
var Code = require('../../../../../shared/code');
var dispatcher = require('../../../util/dispatcher');
var serverListDao = require('../../../dao/serverListDao');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

/**
 * 获得服务器列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.queryServerList = function(msg, session, next) {
    var uid = msg.uid;
    var registerType = msg.registerType;
    var loginName = msg.loginName;
    if(!uid) {
        next(null, {code: Code.FAIL});
    }

    serverListDao.getServerLists(this.app, uid, function(err, serverLists) {
        if(err) {
            next(null, {code: Code.GATE.NO_SERVER_AVAILABLE});
            return;
        }
        var array = [];
        var connectors = [];
        var res = {};
        for(var i = 0 ; i < serverLists.length ; i++) {
            connectors = serverLists[i].connectors;
            connectors = JSON.parse(connectors);
            res = dispatcher.dispatch(uid, connectors);
            logger.info(res);
            array.push({
                id: serverLists[i].id,
                connectors: {
                    host: res.host,
                    port: res.port
                },
                showName: serverLists[i].showName
            });
        }
        logger.info(array);
        next(null, {code: Code.OK, lastLoginServer: 1, serverLists: array});
    });
};

/**
 * 获得入口
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.queryEntry = function(msg, session, next) {
    var uid = msg.uid;
    if(!uid) {
        next(null, {code: Code.FAIL});
        return;
    }

    var connectors = this.app.getServersByType('connector');
    if(!connectors || connectors.length === 0) {
        next(null, {code: Code.GATE.NO_SERVER_AVAILABLE});
        return;
    }

    var res = dispatcher.dispatch(uid, connectors);
    next(null, {code: Code.OK, host: res.host, port: res.clientPort});
};