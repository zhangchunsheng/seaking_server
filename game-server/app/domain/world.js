/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: world
 */
var dataApi = require('../util/dataApi');
var utils = require('../util/utils');
var area = require('./area/area');
var messageServices = require('./messageService');
var pomelo = require('pomelo');
var userDao = require('../dao/userDao');
var taskDao = require('../dao/taskDao');
var logger = require('pomelo-logger').getLogger(__filename);
var Map = require('./map/map');

var maps = {};

var exp = module.exports;

exp.init = function(areasConfig) {
    //Init areas
    for(var key in areasConfig) {
        //init map
        var areaConfig = areasConfig[key];
        maps[areaConfig.id] = new Map(areaConfig);
    }
};

/**
 * Change area, will transfer a player from one area to another
 * @param args {Object} The args for transfer area, the content is {playerId, areaId, target, frontendId}
 * @param cb {funciton} Call back funciton
 * @api public
 */
exp. changeArea = function(args, session, cb) {
    var uid = args.uid;
    var registerType = args.registerType;
    var loginName = args.loginName;
    var playerId = args.playerId;
    var areaId = args.areaId;
    var target = args.target;
    var player = area.getPlayer(playerId);
    var frontendId = args.frontendId;
    area.removePlayer(playerId);
    //messageService.pushMessage({route:'onUserLeave', code: 200, playerId: playerId});

    player.currentScene = target;
    userDao.updatePlayer(player, "currentScene", function(err, success) {
        if(err || !success) {
            err = err || 'update player failed!';
            logger.error(err);
            utils.invokeCallback(cb, err);
        } else {
            session.set('areaId', target);
            session.push('areaId', function(err) {
                if(err) {
                    logger.error('Change area for session service failed! error is : %j', err.stack);
                }
                utils.invokeCallback(cb, null);
            });
        }
    });
};