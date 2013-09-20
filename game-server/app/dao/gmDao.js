/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: gmDao
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var Task = require('../domain/task');
var consts = require('../consts/consts');
var taskApi = require('../util/dataApi').task;
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');

var gmDao = module.exports;

/**
 *
 * @param player
 * @param arguments
 * @param next
 */
gmDao.resetTask = function(app, session, arguments, next) {
    var type = arguments[0];
    var taskId = arguments[1] || "";
    if(typeof type == "string") {

    } else {
        type = consts.correspondingCurTaskType[type];
    }
    app.rpc.area.playerRemote.resetTask(session, {
        playerId: session.get('playerId'),
        areaId: session.get('areaId'),
        type: type,
        taskId: taskId
    }, function(err) {
        if(!!err) {
            logger.error('resetTask error! %j', err);
        }
        next(null, {});
    });
}

gmDao.updateMoney = function(app, session, arguments, next) {
    app.rpc.area.playerRemote.updateMoney(session, {
        playerId: session.get('playerId'),
        areaId: session.get('areaId'),
        money: arguments[0]
    }, function(err) {
        if(!!err) {
            logger.error('resetTask error! %j', err);
        }
        next(null, {});
    });
}

gmDao.updateExp = function(app, session, arguments, next) {
    app.rpc.area.playerRemote.updateExp(session, {
        playerId: session.get('playerId'),
        areaId: session.get('areaId'),
        exp: arguments[0]
    }, function(err) {
        if(!!err) {
            logger.error('resetTask error! %j', err);
        }
        next(null, {});
    });
}