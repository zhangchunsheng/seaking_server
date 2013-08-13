/**
 * Created with JetBrains WebStorm.
 * User: zhang
 * Date: 13-6-28
 * Time: 上午2:02
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var id = 0;

/**
 * The origint zone object
 */
var Zone = function(opts) {
    this.zoneId = id++;
    this.width = opts.width;
    this.height = opts.height;
    this.x = opts.x;
    this.y = opts.y;
};

util.inherits(Zone, EventEmitter);

/**
 * Update the zone, the funciton is time driven
 */
Zone.prototype.update = function() {
};

/**
 * Remove an entity from the zone, default function will do nothing
 */
Zone.prototype.remove = function() {
};

module.exports = Zone;