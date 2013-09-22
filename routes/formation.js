/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: formation
 */
var authService = require('../app/services/authService');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 更改阵型
 * @param req
 * @param res
 */
exports.change = function(req, res) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , formation = msg.formation;

    logger.info(formation);

    if(!formation && Object.prototype.toString.call(formation) !== '[object Array]') {
        next(null, {
            code: consts.MESSAGE.ARGUMENT_EXCEPTION
        });
        return;
    }

    var player = area.getPlayer(session.get('playerId'));
    //需要验证是否有该角色存在
    player.formation = formation;
    playerDao.changeFormation(player, function(err, reply) {
        var status = {
            code: consts.MESSAGE.RES
        };

        player.updateTaskRecord(consts.TaskGoalType.CHANGE_FORMATION, {});

        next(null, status);
    });
}