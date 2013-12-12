/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: equipment
 */
/**
 * Module dependencies
 */
var util = require('util');
var Entity = require('./entity');
var EntityType = require('../../consts/consts').EntityType;

/**
 * Initialize a new 'Equipment' with the given 'opts'.
 * Equipment inherits Entity
 *
 * @class ChannelService
 * @constructor
 * @param {Object} opts
 * @api public
 */

var Equipment = function(opts) {
    Entity.call(this, opts);
    this.type = EntityType.EQUIPMENT;
    this.name = opts.name;
    this.description = opts.description;
    this.price = opts.price;
    this.quality = opts.quality;
    this.level = opts.level;
    this.useLevel = opts.useLevel;
    this.strengthenLevel = opts.strengthenLevel;
    this.resourcePath = opts.resourcePath;

    this.attack = Number(opts.attack);
    this.attackPercentage = Number(opts.attackPercentage);
    this.speedLevel = Number(opts.speedLevel);
    this.speedLevelPercentage = Number(opts.speedLevelPercentage);
    this.hp = Number(opts.hp);
    this.hpPercentage = Number(opts.hpPercentage);
    this.defense = Number(opts.defense);
    this.defensePercentage = Number(opts.defensePercentage);
    this.focus = Number(opts.focus);
    this.criticalHit = Number(opts.criticalHit);
    this.critDamage = Number(opts.critDamage);
    this.dodge = Number(opts.dodge);
    this.block = Number(opts.block);
    this.counter = Number(opts.counter);
    this.counterDamage = Number(opts.counterDamage);
    this.stunt = Number(opts.stunt);
    this.confusion = Number(opts.confusion);
    this.upgradeMaterial = Number(opts.upgradeMaterial);

    this.playerId = opts.characterId;

    this.lifetime = 30000;
    this.time = Date.now();
    this.died = false;
};

util.inherits(Equipment, Entity);

/**
 * Expose 'Equipment' constructor.
 */
module.exports = Equipment;

/**
 * Equipment refresh every 'lifetime' millisecond
 *
 * @api public
 */
Equipment.prototype.update = function(){
    var next = Date.now();
    this.lifetime -= (next - this.time);

    this.time = next;
    if(this.lifetime <= 0) {
        this.died = true;
    }
};
