/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: packageDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Package = require('../domain/package');
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');
var PackageType = require('../consts/consts').PackageType;
var dataApi = require('../util/dataApi');
var packageDao = module.exports;

/**
 * Create Bag
 *
 * @param {Number} characterId Player Id
 * @param {function} cb Call back function
 */
packageDao.createPackage = function(characterId, cb) {

};

/**
 * Find package by characterId
 *
 * @param {Number} characterId Player id.
 * @param {function} cb Call back function.
 */
packageDao.getPackageByCharacterId = function(characterId, cb) {

};

/**
 * Update package
 * @param {Object} package Package object.
 * @param {function} cb Call back function.
 */
packageDao.update = function(val, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    logger.info(val);
    var key = dbUtil.getPlayerKey(val.serverId, val.registerType, val.loginName, val.characterId);
    var value = {
        weapons: val.weapons,
        equipments: val.equipments,
        items: val.items
    };
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).hset(key, "package", JSON.stringify(value), function(err, reply) {
                if(typeof cb == "function")
                    cb(!!err);
                redis.release(client);
            })
            .exec(function (err, replies) {
                console.log(replies);
            });
    });
};

/**
 * Destroy a package
 *
 * @param {number} characterId
 * @param {function} cb
 */
packageDao.destroy = function(characterId, cb) {

};

packageDao.createNewPackage = function(packageInfo, serverId, registerType, loginName, characterId) {
    packageInfo.serverId = serverId;
    packageInfo.registerType = registerType;
    packageInfo.loginName = loginName;
    packageInfo.characterId = characterId;
    var package = new Package(packageInfo);
    return package;
};
packageDao.getType = function(item) {
    var itemId = item.itemId;
    var type = "";
    logger.debug(itemId.indexOf("W"));
    if(itemId.indexOf("W") != -1) {
        type = PackageType.WEAPONS;
    } else if(itemId.indexOf("E") != -1) {
        type = PackageType.EQUIPMENTS;
    } else if(itemId.indexOf("D") != -1) {
        type = PackageType.ITEMS;
    }
    return type;
}
packageDao.fullItem  = function(item){
    var itemId = item.itemId;
    var type = this.getType(item);
    logger.info(type);
    var itemInfo;
    if("items" == type) {
        itemInfo = dataApi.item.findById(itemId);
    } else {
        itemInfo = dataApi.equipment.findById(itemId);
    }
    item.level = itemInfo.level;
    return item;
}
