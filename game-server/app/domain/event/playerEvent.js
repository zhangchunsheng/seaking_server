/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: playerEvent
 */
var area = require('./../area/area');
var consts = require('../../consts/consts');
var messageService = require('./../messageService');
var logger = require('pomelo-logger').getLogger(__filename);

var exp = module.exports;

/**
 * Handle player event
 */
exp.addEventForPlayer = function (player) {
	/**
	 * Handler upgrade event for player, the message will be pushed only to the one who upgrade
	 */
	player.on('upgrade', function() {
		logger.debug('event.onUpgrade: ' + player.level + ' id: ' + player.id);
		var uid = {
            uid: player.userId,
            sid: player.serverId
        };
        logger.info(uid);
		messageService.pushMessageToPlayer(uid, 'onUpgrade', player.strip());
	});

    player.on('completeTask', function(task) {
        logger.debug('event.onCompleteTask: ' + player.level + ' id: ' + player.id);
        var uid = {
            uid: player.userId,
            sid: player.serverId
        };
        logger.info(uid);
        messageService.pushMessageToPlayer(uid, 'onCompleteTask', task);
    });

    player.on('addHP', function() {
        var uid = {
            uid: player.userId,
            sid: player.serverId
        };
        messageService.pushMessageToPlayer(uid, 'onAddHP', player.strip());
    });
};
