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
var skillsV2 = require('../../config/data/skillsV2');
var tacticals = require('../../config/data/tacticals');
var formations = require('../../config/data/formations');
var aptitudes = require('../../config/data/aptitudes');
var altars = require('../../config/data/altars');
var altar_exchange = require('../../config/data/altar_exchange');
var soulFusion = require('../../config/data/soulFusion');
var item = require('../../config/data/item');
var npc = require('../../config/data/npc');
var task = require('../../config/data/task');
var heros = require('../../config/data/heros');
var herosV2 = require('../../config/data/herosV2');
var monster = require('../../config/data/monster');
var induMonstergroup = require('../../config/data/induMonstergroup');
var instancedungeon = require('../../config/data/instancedungeon');
var equipment = require('../../config/data/equipment');
var equipmentLevelup = require('../../config/data/equipmentLevelup');
var equipments = require('../../config/data/equipments');
var forges = require('../../config/data/forges');
var diamonds = require('../../config/data/diamonds');
var partners = require('../../config/data/partners');
var city = require('../../config/data/city');
var indu_event = require('../../config/data/indu_event');
var shops = require('../../config/data/shops');
var casino = require('../../config/data/casino');
var astrology = require("../../config/data/astrology");
var weapons = require("../../config/data/weapons");
var astrologyRandom = require("../../config/data/astrologyRandom");
var astrologyExchange = require("../../config/data/astrologyExchange");
var cliffordRandom = require("../../config/data/cliffordRandom");
var pets = require("../../config/data/pets");
var petsSkillsUpgrade = require("../../config/data/petsSkillsUpgrade");
var petsUpgrade = require("../../config/data/petsUpgrade");
var feedItem = require("../../config/data/feedItem");
var petsRandom = require("../../config/data/petsRandom");
var event = require("../../config/data/event");
var onces = require("../../config/onces");
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
    var mresult = {};
    data.forEach(function(k) {
        item = mapData(fields, k);
        result[item.id] = item;
        if(typeof item._id != "undefined") {
            mresult[item._id] = item;
        } else {
            mresult[item.id] = item;
        }
    });

    this.data = result;
    this.mdata = mresult;
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

Data.prototype.findByMId = function(id) {
    return this.mdata[id];
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
    skillsV2: new Data(skillsV2),
    tacticals: new Data(tacticals),
    formations: new Data(formations),
    aptitudes: new Data(aptitudes),
    altars: new Data(altars),
    altar_exchange: new Data(altar_exchange),
    soulFusion: new Data(soulFusion),
    task: new Data(task),
    heros: new Data(heros),
    herosV2: new Data(herosV2),
    monster: new Data(monster),
    induMonstergroup: new Data(induMonstergroup),
    instancedungeon: new Data(instancedungeon),
    equipment: new Data(equipment),
    equipmentLevelup: new Data(equipmentLevelup),
    equipments: new Data(equipments),
    forges: new Data(forges),
    diamonds: new Data(diamonds),
    partners: new Data(partners),
    city: new Data(city),
    indu_event: new Data(indu_event) ,
    shops: new Data(shops),
    casino : new Data(casino),
    astrology : new Data(astrology),
    astrologyRandom: new Data(astrologyRandom),
    weapons : new Data(weapons),
    astrologyExchange: new Data(astrologyExchange),
    cliffordRandom: new Data(cliffordRandom),
    pets: new Data(pets),
    petsUpgrade: new Data(petsUpgrade),
    feedItem: new Data(feedItem),
    petsRandom: new Data(petsRandom),
    petsSkillsUpgrade: new Data(petsSkillsUpgrade),
    event: new Data(event),
    onces: onces
};
