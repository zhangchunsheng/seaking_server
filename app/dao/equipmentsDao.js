/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: equipmentDao
 */
var equipApi = require('../utils/dataApi').equipment;
var Equipments = require('../domain/equipments');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var equipmentsDao = module.exports;

/**
 * Create equipment
 *
 * @param {Number} characterId Player id.
 * @param {function} cb Callback function
 */
equipmentsDao.createEquipments = function (characterId, cb) {
    utils.invokeCallback(cb, null, {});
};

/**
 * Get player's equipment by characterId
 *
 * @param {Number} characterId
 * @param {funciton} cb
 */
equipmentsDao.getEquipmentsByCharacterId = function(characterId, cb) {
    
};

/**
 * Updata equipment
 * @param {Object} val Update params, in a object.
 * @param {function} cb
 */
equipmentsDao.update = function(val, cb) {
    var characterId = val.characterId;
    if(characterId.indexOf("P") > 0) {
        var array = characterId.split("P");
        characterId = array[0] + "_P" + array[1];
    }
    var key = dbUtil.getPlayerKey(val.serverId, val.registerType, val.loginName, characterId);
    var value = {
        weapon: val.weapon,
        necklace: val.necklace,
        helmet: val.helmet,
        armor: val.armor,
        belt: val.belt,
        legguard: val.legguard,
        amulet: val.amulet,
        shoes: val.shoes,
        ring: val.ring
    };
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).hset(key, "equipments", JSON.stringify(value), function(err, reply) {
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
 * destroy equipment
 *
 * @param {number} characterId
 * @param {function} cb
 */
equipmentsDao.destroy = function(characterId, cb) {

};

equipmentsDao.createNewEquipment = function(equipmentInfo, serverId, registerType, loginName, characterId) {
    equipmentInfo.serverId = serverId;
    equipmentInfo.registerType = registerType;
    equipmentInfo.loginName = loginName;
    equipmentInfo.characterId = characterId;
    var equipments = new Equipments(equipmentInfo);
    return equipments;
};