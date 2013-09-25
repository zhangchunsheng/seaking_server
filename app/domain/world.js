/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: world
 */
var dataApi = require('../utils/dataApi');
var utils = require('../utils/utils');
var area = require('./area/area');
var areaService = require('../services/areaService');
var userService = require('../services/userService');

var exp = module.exports;

/**
 * Change area, will transfer a player from one area to another
 * @param args {Object} The args for transfer area, the content is {playerId, areaId, target, frontendId}
 * @param cb {funciton} Call back funciton
 * @api public
 */
exp.changeArea = function(args, session, cb) {
    var uid = args.uid;
    var serverId = args.serverId;
    var registerType = args.registerType;
    var loginName = args.loginName;
    var playerId = args.playerId;
    var areaId = args.areaId;
    var target = args.target;

    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        area.removePlayer(player, function(err, reply) {
            player.currentScene = target;
            userService.updatePlayer(player, "currentScene", function(err, success) {
                if(err || !success) {
                    err = err || 'update player failed!';
                    console.log(err);
                    utils.invokeCallback(cb, err);
                } else {
                    utils.invokeCallback(cb, null);
                }
            });
        });
    });
};

exp.removeAndUpdatePlayer = function(areaId, player, cb) {
    areaService.removeAndUpdatePlayer(areaId, player, cb);
}