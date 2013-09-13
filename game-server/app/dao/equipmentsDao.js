/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: equipmentDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var equipApi = require('../util/dataApi').equipment;
var Equipments = require('../domain/equipments');
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');

var equipmentsDao = module.exports;

/**
 * Create equipment
 *
 * @param {Number} characterId Player id.
 * @param {function} cb Callback function
 */
equipmentsDao.createEquipments = function (characterId, cb) {

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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    logger.info(val);
    var key = dbUtil.getPlayerKey(val.serverId, val.registerType, val.loginName, val.characterId);
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