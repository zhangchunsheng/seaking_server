/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: eventManager
 */
var EntityType = require('../../consts/consts').EntityType;
var pomelo = require('pomelo');
var playerEvent = require('./playerEvent');
var exp = module.exports;
var logger = require('pomelo-logger').getLogger(__filename);

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
    var app = pomelo.app;
    player.on('save', function() {
        app.get('sync').exec('playerSync.updatePlayer', player.id, player.updateColumn());
    });

    player.packageEntity.on('save', function() {
        app.get('sync').exec('packageSync.updatePackage', player.id, player.packageEntity.strip());
    });

    player.equipmentsEntity.on('save', function() {
        app.get('sync').exec('equipmentsSync.updateEquipments', player.id, player.equipmentsEntity.strip());
    });
}