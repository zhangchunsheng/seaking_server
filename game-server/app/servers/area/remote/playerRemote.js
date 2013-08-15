/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: playerRemote
 */
/**
 * Module dependencies
 */

var utils = require('../../../util/utils');
var userDao = require('../../../dao/userDao');
var packageDao = require('../../../dao/packageDao');
var taskDao = require('../../../dao/taskDao');
var equipmentsDao = require('../../../dao/equipmentsDao');
var area = require('../../../domain/area/area');
var consts = require('../../../consts/consts');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);

var exp = module.exports;

/**
 * Player exits. It will persistent player's state in the database.
 *
 * @param {Object} args
 * @param {Function} cb
 * @api public
 */
exp.playerLeave = function(args, cb) {
    var areaId = args.areaId;
    var playerId = args.playerId;
    var player = area.getPlayer(playerId);

    if(!player) {
        utils.invokeCallback(cb);
        return;
    }

    userDao.updatePlayerAttribute(player);
    packageDao.update(player.packageEntity.strip());
    equipmentsDao.update(player.equipmentsEntity.strip());
    taskDao.updateTask(player.curTasksEntity.strip());

    area.removePlayer(playerId);
    messageService.pushMessage({route: 'onUserLeave', code: consts.MESSAGE.RES, playerId: playerId});
    utils.invokeCallback(cb);
};
