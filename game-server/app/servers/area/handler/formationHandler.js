/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-31
 * Description: formationHandler
 */
var area = require('../../../domain/area/area');
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var playerDao = require('../../../dao/playerDao');
var async = require('async');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var formula = require('../../../consts/formula');
var Player = require('../../../domain/entity/player');
var Monster = require('../../../domain/entity/monster');
var EntityType = require('../../../consts/consts').EntityType;
var Fight = require('../../../domain/battle/fight');
var consts = require('../../../consts/consts');

var handler = module.exports;

/**
 * 改变阵型 {"formation":[{"playerId":"S1C10"},null,null,null,null,null,null]}
 * @param msg
 * @param session
 * @param next
 */
handler.change = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , formation = msg.formation;

    logger.info(formation);

    if(!formation && Object.prototype.toString.call(formation) !== '[object Array]') {
        next(null, {
            status: -1
        });
        return;
    }

    var player = area.getPlayer(session.get('playerId'));
    //需要验证是否有该角色存在
    player.formation = formation;
    playerDao.changeFormation(player, function(err, reply) {
        var status = {
            status: 1
        };
        next(null, status);
    })
}