/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: routeUtil
 */
var exp = module.exports;
var logger = require('pomelo-logger').getLogger(__filename);

exp.area = function(session, msg, app, cb) {
    var areas = app.get('areaIdMap');
    var serverId = areas[session.get('areaId')];
    logger.info(serverId);

    if(!serverId) {
        cb(new Error('can not find server info for type:' + msg.serverType));
        return;
    }

    cb(null, serverId);
};

exp.connector = function(session, msg, app, cb) {
    if(!session) {
        cb(new Error('fail to route to connector server for session is empty'));
        return;
    }

    if(!session.frontendId) {
        cb(new Error('fail to find frontend id in session'));
        return;
    }

    cb(null, session.frontendId);
};

exp.chat = function(session, msg, app, cb) {
    var chatServers = app.getServersByType('chat');
    if (!chatServers) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    var res = dispatcher.dispatch(session.get('rid'), chatServers);
    cb(null, res.id);
};