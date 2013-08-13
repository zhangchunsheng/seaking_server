/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: map
 */
var buildFinder = require('pomelo-pathfinding').buildFinder;
var geometry = require('../../util/geometry');
var logger = require('pomelo-logger').getLogger(__filename);
var formula = require('../../consts/formula');
var fs = require('fs');

/**
 * The data structure for map in the area
 */
var Map = function(opts) {
    this.mapPath = process.cwd() + opts.path;
    this.map = null;
    this.weightMap = null;
    this.name = opts.name;
};

var pro = Map.prototype;

module.exports = Map;