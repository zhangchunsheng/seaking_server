/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: equipmentsSync
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = {
    updateEquipments: function(dbclient, val, cb) {
        var redisConfig = pomelo.app.get('redis');

        logger.info(val);
        var key = "S" + val.serverId + "_T" + val.registerType + "_" + val.loginName + "_C" + val.characterId;
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
        dbclient.command(function(client) {
            client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

            }).hset(key, "equipments", JSON.stringify(value), function(err, reply) {
                    cb(!!err);
                    dbclient.release(client);
                })
                .exec(function (err, replies) {
                    console.log(replies);
                });
        });
    }

};