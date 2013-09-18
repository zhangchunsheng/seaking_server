/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: playerSync
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports =  {
    updatePlayer:function(dbclient, player) {
        var redisConfig = pomelo.app.get('redis');

        var column = player.columns;
        var key = "S" + player.serverId + "_T" + player.registerType + "_" + player.loginName;
        dbclient.command(function(client) {
            client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

            }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + player.serverId + "_T" + player.registerType + "_" + player.loginName + "_C" + reply;

                    var array = [];
                    for(var o in column) {
                        array.push(["hset", key, o, column[o]]);
                    }
                    client.multi(array).exec(function(err, replies) {
                        dbclient.release(client);
                    });
                }
            })
            .exec(function (err, replies) {

            });
        });
    }
};