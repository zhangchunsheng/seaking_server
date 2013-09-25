/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: eventManager
 */
var EntityType = require('../../consts/consts').EntityType;
var playerEvent = require('./playerEvent');

var exp = module.exports;

/**
 * Listen event for entity
 */
exp.addEvent = function(entity) {
    switch(entity.type) {
        case EntityType.PLAYER :
            playerEvent.addEventForPlayer(entity);
            addSaveEvent(entity);
            break;
    }
};

/**
 * Add save event for player
 * @param {Object} player The player to add save event for.
 */
function addSaveEvent(player) {
    player.on('save', function() {
        console.log("player sync data");
        player.syncData();
    });

    player.packageEntity.on('save', function() {
        console.log("package sync data");
        player.packageEntity.syncData();
    });

    player.equipmentsEntity.on('save', function() {
        console.log("equipments sync data");
        player.equipmentsEntity.syncData();
    });
}