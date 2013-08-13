/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: playerFilter
 */
var logger = require('pomelo-logger').getLogger(__filename);
var area = require('../../../domain/area/area');

module.exports = function() {
    return new Filter();
};

var Filter = function() {
};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next){
    var player = area.getPlayer(session.get('playerId'));

    if(!player) {
        var route = msg.__route__;

        if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterScene$/i) >= 0) {
            next();
            return;
        } else {
            next(new Error('No player exist!'));
            return;
        }
    }

    next();
};