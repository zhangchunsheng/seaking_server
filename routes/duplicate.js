var Fight = require("../app/domain/fight");
var TL = require("../app/domain/tl").TL;
var utils = require("../app/utils/utils");
var userService = require("../app/services/userService");
var Code = require("../shared/code");
var dataApi = require("../app/utils/dataApi");
var redis =  require('../app/dao/redis/redis')
 , redisConfig = require('../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
var Battle = Fight.Battle;
var battleDao = require("../app/dao/_battleDao");
var duplicate = require("../app/domain/duplicate").duplicate;
exports.start = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var duplicateId = msg.duplicateId;
    var Key = utils.getDbKey(session);
    var induInfo = dataApi.instancedungeon.findById(duplicateId);
    if(!induInfo) {
        return utils.send(msg, res, {
            code: Code.FAIL,
            err: "没有这个副本"
        });
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.duplicate = new duplicate(induInfo);
        var setArray = [
            ["select", redisConfig.database.SEAKING_REDIS_DB]
        ];
        setArray.push(["hset", Key, "duplicate", JSON.stringify(player.duplicate)]);
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err) {
                    utils.send(msg, res, {
                        code: Code.FAIL,
                        err: err
                    });
                }else {
                    utils.send(msg, res, {
                        code: Code.OK,
                        data: {
                            duplicate: player.duplicate
                        }
                    });
                }
            });
        })
       /* utils.send(msg, res, {
            code: Code.OK,
            data: {
                duplicate: player.duplicate
            }
        });*/
    });
}

exports.get = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , eid = msg.eid;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var eventId = msg.eventId;
    var Key = utils.getDbKey(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        utils.send(msg, res, {
            code: Code.OK,
            data: player.duplicate
        });
        //player.duplicate

    });
}
var event = require("../app/domain/gameEvent");
//var Tasks = require("../app/domain/_task").Tasks;
exports.trigger = function(req, res) {
	var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var eventId = msg.eventId;
    var Key = utils.getDbKey(session);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var duplicate = player.duplicate;
        console.log(duplicate);
        var data = {} ;
        if(duplicate.data[eventId] === undefined) {
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "当前副本中没有该事件"
            });
        }
        var setArray = [
            ["select", redisConfig.database.SEAKING_REDIS_DB]
        ];
    	if(eventId.indexOf("MG") >= 0) {
            mInfo = dataApi.induMonstergroup.findById(eventId);
            data = battleDao.battleMonster({
                player: player, 
                Key: Key,
                setArray: setArray,
                mInfo: mInfo
            });
            if(data.result.win){
                //副本奖励
                duplicate.data[eventId] = true;
                
               
            }else {
                console.log("没有打过小朋友");
                return utils.send(msg, res, {
                    code: Code.OK,
                    data: data
                })
            }

    	}else if(eventId.indexOf("E") >= 0) {
            var eInfo = dataApi.event.findById(eventId);
            try{
                event.do(eInfo, player,Key, setArray, data);
            }catch(e) {
                return utils.send(msg, res, e);
            }
            
            duplicate.data[eventId] = true;
    	}
        var r = true;
        console.log(duplicate);
        //检验全部是否完成
        for(var i in duplicate.data) {
            if(!duplicate.data[i]) {
                r = false;
                break;
            }
        }
        if(r) {
            var info = dataApi.instancedungeon.findById(duplicate.id);
            player.addExp(info.getExp, Key, setArray, data);
            player.addMoney(info.getMoney, Key, setArray, data);
            if(info.getItems) {
                var items = info.getItems.split('|');
                var changeItems = [];
                for(var i = 0, len = items; i < len; i+=2) {
                    var changeItem =player.packageEntity.addItemWithNoType(player, {
                        itemId: items[i],
                        itemNum: items[i+1]
                    });
                    changeItems.push(changeItem);
                }
                data.changeItems = changeItems;
            }
            
            var tasks = player.tasks.updateDu(player.duplicate.id);
            if(tasks.length > 0) {
                data.tasks = tasks;
                setArray.push(["hset", Key, "tasks", JSON.stringify(player.tasks)]);
            }
           //完成清空？还是等下次进入副本清空
            player.duplicate = {};
        }
        setArray.push(["hset", Key, "duplicate", JSON.stringify(player.duplicate)]);
        data.duplicate = player.duplicate;
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err) {
                    utils.send(msg, res, {
                        code: Code.FAIL,
                        err: err
                    }) ;
                }else {
                    utils.send(msg, res, {
                        code:Code.OK,
                        data: data
                    })
                }
            });
        });
    });
}