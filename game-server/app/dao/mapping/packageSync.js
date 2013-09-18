/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: packageSync
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = {
    updatePackage: function (dbclient, val, cb) {
        var redisConfig = pomelo.app.get('redis');

        logger.info(val);
        var key = "S" + val.serverId + "_T" + val.registerType + "_" + val.loginName + "_C" + val.characterId;
        var value = {
            weapons: val.weapons,
            equipments: val.equipments,
            items: val.items
        };
        dbclient.command(function(client) {
            client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

            }).hset(key, "package", JSON.stringify(value), function(err, reply) {
                    cb(!!err);
                    dbclient.release(client);
                })
                .exec(function (err, replies) {
                    console.log(replies);
                });
        });
    }
};