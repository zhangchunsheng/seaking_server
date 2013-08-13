/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-01
 * Description: induHandler
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../../consts/consts');
var channelUtil = require('../../../util/channelUtil');
var async = require('async');
var induDao = require('../../../dao/induDao');
var area = require('../../../domain/area/area');

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
 * 获得副本信息
 * @param msg
 * @param session
 * @param next
 */
pro.getInduInfo = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , induId = msg.induId;
    var self = this;
    induDao.getInduInfo(serverId, registerType, loginName, induId, function(err, induInfo) {
        next(null, {code: consts.MESSAGE.RES, induInfo: induInfo});
    });
}

/**
 * 获得怪物组信息
 * @param msg
 * @param session
 * @param next
 */
pro.getMonstergroup = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , mgid = msg.mgid;
    var self = this;
    induDao.getInduMonstergroup(mgid, function(err, induMonstergroup) {
        next(null, {code: consts.MESSAGE.RES, induMonstergroup: induMonstergroup});
    });
}

pro.getMonsterInfo = function(msg, session, next) {

}