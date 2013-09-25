/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: playerEvent
 */
var consts = require('../../consts/consts');

var exp = module.exports;

/**
 * Handle player event
 */
exp.addEventForPlayer = function (player) {
	/**
	 * Handler upgrade event for player, the message will be pushed only to the one who upgrade
	 */
	player.on('upgrade', function() {
        console.log("upgrade");
	});

    player.on('completeTask', function(task) {
        console.log("completeTask");
    });

    player.on('taskProgress', function(task) {
        console.log("taskProgress");
    });

    player.on('addHP', function() {
        console.log("addHP");
    });
};
