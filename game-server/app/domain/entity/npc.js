/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: npc
 */
/**
 * Module dependencies
 */
var Entity = require('./entity');
var util = require('util');
var EntityType = require('../../consts/consts').EntityType;
var consts = require('../../consts/consts');
var formula = require('../../consts/formula');
var area = require('../area/area');

/**
 * Initialize a new 'Npc' with the given 'opts'.
 * Npc inherits Entity
 *
 * @param {Object} opts
 * @api public
 */
var Npc = function(opts) {
    Entity.call(this, opts);
    this.id = opts.id;
    this.type = EntityType.NPC;
    this.orientation = opts.orientation;
    this.width = opts.width;
    this.height = opts.height;
    this.kindType = opts.kindType;
};

util.inherits(Npc, Entity);

module.exports = Npc;
