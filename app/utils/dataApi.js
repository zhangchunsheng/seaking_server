/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: dataApi
 */
// require json files
var character = require('../../config/data/character');
var experience = require('../../config/data/experience');
var skillList = require('../../config/data/skillList');
var item = require('../../config/data/item');
var npc = require('../../config/data/npc');
var task = require('../../config/data/task');
var heros = require('../../config/data/heros');
var monster = require('../../config/data/monster');
var induMonstergroup = require('../../config/data/induMonstergroup');
var instancedungeon = require('../../config/data/instancedungeon');
var equipment = require('../../config/data/equipment');
var equipmentLevelup = require('../../config/data/equipmentLevelup');
var partners = require('../../config/data/partners');
var city = require('../../config/data/city');
var indu_event = require('../../config/data/indu_event');
var shops = require('../../config/data/shops');
var casino = require('../../config/data/casino');
/**
 * Data model `new Data()`
 *
 * @param {Array}
 *
 */
var Data = function(data) {
    var fields = {};
    data[1].forEach(function(i, k) {
        fields[i] = k;
    });
    data.splice(0, 2);

    var result = {}, item;
    data.forEach(function(k) {
        item = mapData(fields, k);
        result[item.id] = item;
    });

    this.data = result;
};

/**
 * map the array data to object
 *
 * @param {Object}
 * @param {Array}
 * @return {Object} result
 * @api private
 */
var mapData = function(fields, item) {
    var obj = {};
    for (var k in fields) {
        obj[k] = item[fields[k]];
    }
    return obj;
};

/**
 * find items by attribute
 *
 * @param {String} attribute name
 * @param {String|Number} the value of the attribute
 * @return {Array} result
 * @api public
 */
Data.prototype.findBy = function(attr, value) {
    var result = [];
    var i, item;
    for (i in this.data) {
        item = this.data[i];
        if (item[attr] == value) {
            result.push(item);
        }
    }
    return result;
};

Data.prototype.findBigger = function(attr, value) {
    var result = [];
    value = Number(value);
    var i, item;
    for (i in this.data) {
        item = this.data[i];
        if (Number(item[attr]) >= value) {
            result.push(item);
        }
    }
    return result;
};

Data.prototype.findSmaller = function(attr, value) {
    var result = [];
    value = Number(value);
    var i, item;
    for (i in this.data) {
        item = this.data[i];
        if (Number(item[attr]) <= value) {
            result.push(item);
        }
    }
    return result;
};

/**
 * find item by id
 *
 * @param id
 * @return {Obj}
 * @api public
 */
Data.prototype.findById = function(id) {
    return this.data[id];
};

/**
 * find all item
 *
 * @return {array}
 * @api public
 */
Data.prototype.all = function() {
    return this.data;
};

module.exports = {
    character: new Data(character),
    experience: new Data(experience),
    npc: new Data(npc),
    item: new Data(item),
    skillList: new Data(skillList),
    task: new Data(task),
    heros: new Data(heros),
    monster: new Data(monster),
    induMonstergroup: new Data(induMonstergroup),
    instancedungeon: new Data(instancedungeon),
    equipment: new Data(equipment),
    equipmentLevelup: new Data(equipmentLevelup),
    partners: new Data(partners),
    city: new Data(city),
    indu_event: new Data(indu_event)  ,
    shops: new Data(shops),
    casino : new Data(casino)
};
