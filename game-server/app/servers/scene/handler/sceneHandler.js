/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-02
 * Description: sceneHandler
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../../consts/consts');
var channelUtil = require('../../../util/channelUtil');
var async = require('async');
var userDao = require('../../../dao/userDao');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;

    if(!this.app)
        logger.error(app);
};

var pro = Handler.prototype;

/**
 * 进入场景
 * @param msg
 * @param session
 * @param next
 */
pro.enterScene = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , sceneId = msg.sceneId;
    var self = this;
    logger.info(sceneId);
    userDao.enterScene(serverId, registerType, loginName, sceneId, function(err, sceneId) {
        if(err) {
            next(null, {code: consts.MESSAGE.ERR});
        } else {
            next(null, {code: consts.MESSAGE.RES, sceneId: sceneId});
        }
    });
}