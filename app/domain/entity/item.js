/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: item
 */
/**
 * Module dependencies
 */
var util = require('util');
var Entity = require('./entity');
var EntityType = require('../../consts/consts').EntityType;

/**
 * Initialize a new 'Item' with the given 'opts'.
 * Item inherits Entity
 *
 * @param {Object} opts
 * @api public
 */
var Item = function(opts) {
    Entity.call(this, opts);
    this.type = EntityType.ITEM;
    this.name = opts.name;
    this.desc = opts.desc;
    this.englishDesc = opts.englishDesc;
    this.hp = opts.hp;
    this.price = opts.price;
    this.heroLevel = opts.heroLevel;
    this.imgId = opts.imgId;
    this.lifetime = 30000;
    this.time = Date.now();
    this.playerId = opts.playerId;
    this.died = false;
};

util.inherits(Item, Entity);

/**
 * Expose 'Item' constructor.
 */
module.exports = Item;

/**
 * Item refresh every 'lifetime' millisecond
 *
 * @api public
 */
Item.prototype.update = function(){
    var next = Date.now();
    this.lifetime -= (next - this.time);
    this.time = next;
    if(this.lifetime <= 0) {
        this.died = true;
    }
};
