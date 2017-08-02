/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: userDao
 */
var dataApi = require('../utils/dataApi');
var Player = require('../domain/entity/player');
var Tasks = require('../domain/tasks');
var Skills = require('../domain/skill/skills');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var packageDao = require('./packageDao');
var packageUtil = require('../utils/packageUtil');
var induDao = require('./induDao');
var partnerDao = require('./partnerDao');
var playerDao = require('./playerDao');
var friendDao = require('./friendDao');
var async = require('async');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var buffUtil = require('../utils/buffUtil');
var playerUtil = require('../utils/playerUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var ucenter = require('../lib/ucenter/ucenter');

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var userDao = module.exports;

/**
 * Get user data by loginName.
 * @param {Number} serverId
 * @param {Number} registerType
 * @param {String} loginName
 * @param {function} cb
 */
userDao.getUserInfo = function (serverId, registerType, loginName, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).hgetall(key, function(err, reply) {
            redis.release(client);
            utils.invokeCallback(cb, null, reply);
        })
        .exec(function (err, replies) {

        });
    });
};

/**
 * 更新用户信息
 * @param serverId
 * @param registerType
 * @param loginName
 * @param cb
 */
userDao.updateUserInfo = function(serverId, registerType, loginName, cb) {
    var date = new Date();
    var userInfo = {
        lastLoginDate: date.getTime()
    };
    userDao.saveUserInfo(userInfo, serverId, registerType, loginName, cb);
}

/**
 * 记录玩家进入游戏，更新hp等信息
 * @param player
 * @param serverId
 * @param registerType
 * @param loginName
 * @param cb
 */
userDao.logLogin = function(player, serverId, registerType, loginName, cb) {
    userDao.getUserInfo(serverId, registerType, loginName, function(err, reply) {
        var date = new Date();
        var lastLoginDate = date.getTime();
        if(typeof reply.lastLoginDate != "undefined")
            lastLoginDate = reply.lastLoginDate;

        var updateRoleDate = date.getTime();
        if(typeof reply.updateRoleDate != "undefined")
            updateRoleDate = reply.updateRoleDate;

        var hp = formula.calculateAddHp(player, date, updateRoleDate);
        var ghost = formula.calculateAddGhost(player, date, updateRoleDate);

        playerDao.updatePlayerAndPartnersInfo(player, {
            hp: hp,
            ghost: ghost
        }, cb);

        var userInfo = {
            lastLoginDate: date.getTime(),
            updateRoleDate: date.getTime()
        };
        userDao.saveUserInfo(userInfo, serverId, registerType, loginName, function(err, reply) {

        });
    });
}

/**
 * 更新血量和魂力
 * @param player
 * @param serverId
 * @param registerType
 * @param loginName
 * @param cb
 */
userDao.updateRoleData = function(player, serverId, registerType, loginName, cb) {
    userDao.getUserInfo(serverId, registerType, loginName, function(err, reply) {
        var date = new Date();

        var updateRoleDate = date.getTime();
        if(typeof reply.updateRoleDate != "undefined")
            updateRoleDate = reply.updateRoleDate;

        var hp = formula.calculateAddHp(player, date, updateRoleDate);
        var ghost = formula.calculateAddGhost(player, date, updateRoleDate);

        playerDao.updatePlayerAndPartnersInfo(player, {
            hp: hp,
            ghost: ghost
        }, cb);

        var userInfo = {
            updateRoleDate: date.getTime()
        };
        userDao.saveUserInfo(userInfo, serverId, registerType, loginName, function(err, reply) {

        });
    });
}

userDao.updateHP = function(player, serverId, registerType, loginName, cb) {

}

/**
 * 记录玩家离开游戏
 */
userDao.logLogout = function(serverId, registerType, loginName, cb) {
    var date = new Date();
    var userInfo = {
        lastLoginDate: date.getTime()
    };
    userDao.saveUserInfo(userInfo, serverId, registerType, loginName, cb);
}

/**
 * 初始化用户信息
 * @param userId
 * @param serverId
 * @param registerType
 * @param loginName
 * @param cb
 */
userDao.initUserInfo = function(userId, serverId, registerType, loginName, cb) {
    var date = new Date();
    var userInfo = {
        userId: userId,
        registerDate: date.getTime(),
        lastLoginDate: date.getTime(),
        onlineTime: 0,
        onlineDayNum: 0,
        onlineDayNumContinuous: 0,
        isOnline: 1,
        date: date.getTime(),
        bz: 1
    };

    userDao.saveUserInfo(userInfo, serverId, registerType, loginName, cb);
}

/**
 * 保存用户信息
 * @param userInfo
 * @param userId
 * @param serverId
 * @param registerType
 * @param loginName
 * @param cb
 */
userDao.saveUserInfo = function(userInfo, serverId, registerType, loginName, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {
            var array = [];
            for(var o in userInfo) {
                array.push(["hset", key, o, userInfo[o]]);
            }
            client.multi(array).exec(function(err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, replies);
            });
        }) .exec(function (err, replies) {

        });
    });
}

/**
 * Get an user's all players by loginName
 * @param {Number} serverId.
 * @param {Number} registerType
 * @param {loginName} loginName
 * @param {function} cb Callback function.
 */
userDao.getCharactersByLoginName = function(serverId, registerType, loginName, cb) {
    userDao.getCharacterAllInfo(serverId, registerType, loginName, 0, function(err, character) {
        var array = [];
        array.push(character);
        utils.invokeCallback(cb, null, array);
    });
};

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
userDao.is_exists_nickname = function(serverId, nickname, next) {
    var key = "S" + serverId + "_exist_nickname";
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).sismember(key, nickname, function(err, reply) {
            redis.release(client);
            utils.invokeCallback(next, null, reply);
        })
        .exec(function (err, replies) {

        });
    });
}

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
userDao.has_nickname_player = function(serverId, nickname, next) {
    var key = "S" + serverId + "_N" + nickname;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).exists(key, function(err, reply) {
                redis.release(client);
                utils.invokeCallback(next, null, reply);
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 * 通过id查找nickname
 * @param playerId
 * @param cb
 */
userDao.getNicknameByPlayerId = function(playerId, cb ) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB,function() {

        }).get(playerId, function(err, reply) {
                if(!!err) {
                    redis.release(client);
                    utils.invokeCallback(cb, "不存在playerId");
                    return;
                }
                client.hget(reply, "nickname", function(err, reply) {
                    if(!!err) {
                        redis.release(client);
                        utils.invokeCallback(cb, err);
                        return;
                    }
                    redis.release(client);
                    utils.invokeCallback(cb, null, reply);
                });
            }).exec(function(err,reply) {

            });
    });
}

/**
 * 通过nickname查找到id
 * @param serverId
 * @param nickname
 * @param cb
 */
userDao.getPlayerIdByNickname = function(serverId, nickname, cb) {
    var key = "S" + serverId + "_N" + nickname;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).get(key, function(err, reply) {
            client.hget(reply, "id", function(err, reply) {
                if(!!err) {
                    redis.release(client);
                    utils.invokeCallback(cb, null);
                    return;
                }
                redis.release(client);
                utils.invokeCallback(cb, null, reply);
            });
        }).exec(function (err, replies) {

        });
    });
}

userDao.getCharacterInfoByNickname = function(serverId, nickname, cb) {
    var key = "S" + serverId + "_N" + nickname;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).get(key, function(err, reply) {//S1_T2_w106451_C10212
                redis.release(client);
                utils.invokeCallback(cb, null, reply);
            }).exec(function (err, replies) {

            });
    });
}

/**
 * 創建角色
 */
userDao.createCharacter = function(serverId, userId, registerType, loginName, cId, nickname, isRandom, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;// 先判断是否已创建角色

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hexists(key, "characters", function(err, reply) {
            if(reply == 0) {
                userDao.getCharacterId(client, function(err, characterId) {
                    var character = playerUtil.initCharacterV2({
                        cId: cId,
                        serverId: serverId,
                        characterId: characterId,
                        userId: userId,
                        registerType: registerType,
                        loginName: loginName,
                        nickname: nickname,
                        isRandom: isRandom
                    });

                    //client.hset(key, "characters", characterId);
                    userDao.initUserInfo(userId, serverId, registerType, loginName, function(err, reply) {

                    });

                    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);

                    var data = {
                        registerType: registerType,
                        loginName: loginName,
                        serverId: serverId,
                        cId: cId,
                        characterId: characterId,
                        nickname: nickname,
                        level: character.level
                    }
                    ucenter.addPlayer(data);

                    var array = [];
                    dbUtil.getMultiCommand(array, key, character);
                    dbUtil.saveCharacters(array, serverId, registerType, loginName, characterId)
                    dbUtil.saveNickname(array, serverId, nickname);
                    dbUtil.savePlayerIdToCharacter(array, character.id, key);
                    dbUtil.saveNicknameToCharacter(array, serverId, nickname, key);
                    if(isRandom == 1) {
                        dbUtil.removeFromCanUseNickname(array, serverId, nickname);
                    }
                    client.multi(array).exec(function(err, replies) {
                        var taskInfo = {};
                        for(var o in character.curTasks) {
                            if(o == "currentDayTask") {
                                taskInfo = dataApi.task.findById(character.curTasks[o][0].taskId);
                                for(var o1 in taskInfo) {
                                    character.curTasks[o][o1] = taskInfo[o1];
                                }
                            } else {
                                taskInfo = dataApi.task.findById(character.curTasks[o].taskId);
                                for(var o1 in taskInfo) {
                                    character.curTasks[o][o1] = taskInfo[o1];
                                }
                            }
                        }

                        var player = playerUtil.getPlayer(character);
                        //createEPTInfo(player, serverId, registerType, loginName, character.characterId);
                        playerUtil.createEntity(player, serverId, registerType, loginName, character.characterId);
                        redis.release(client);
                        utils.invokeCallback(cb, null, player);
                    });
                });
            } else {
                //userDao.getCharacterInfo(serverId, registerType, loginName, cb);
                redis.release(client);
                userDao.getCharacterAllInfo(serverId, registerType, loginName, reply, cb);
            }
        })
        .exec(function (err, replies) {

        });
    });
};

/**
 * 获得characterId
 */
userDao.getCharacterId = function(client, callback) {
    var key = "characterId";
    client.incr(key, function(err, reply) {
        callback.call(this, err, reply);
    });
}

/**
 *
 * @param characterId
 * @returns {string}
 */
userDao.getRealCharacterId = function(characterId) {
    characterId = characterId.substr(characterId.indexOf("C") + 1);
    return characterId;
}

/**
 * Get all the information of a character, include equipments, package, tasks.
 * @param {String} characterId
 * @param {function} cb
 */
userDao.getCharacterAllInfo = function (serverId, registerType, loginName, characterId, cb, needCalculateWeapon) {
    async.parallel([
        function(callback) {
            userDao.getCharacterInfo(serverId, registerType, loginName, function(err, character) {
                if(!!err || !character) {
                    console.log('Get user for userDao failed! ' + err);
                } else {
                    characterId = character.id;
                }

                //var characterId = userDao.getRealCharacterId(characterId);
                callback(err, character);
            });
        }
    ],
    function(err, results) {
        if(!!err) {
            utils.invokeCallback(cb, err, null);
            return;
        }
        var character = results[0];
        //createEPTInfo(character, serverId, registerType, loginName, characterId);
        playerUtil.createEntity(character, serverId, registerType, loginName, characterId);

        if(typeof needCalculateWeapon != "undefined" && needCalculateWeapon == true)
            character.updateAttribute();

        utils.invokeCallback(cb, null, character);
    });
};

/**
 * 创建装备、背包、任务对象
 * @param character
 * @param serverId
 * @param registerType
 * @param loginName
 * @param characterId
 */
 /*
function createEPTInfo(character, serverId, registerType, loginName, characterId) {
    var equipments = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId, character);
    var package = packageDao.createNewPackage(character.package, serverId, registerType, loginName, characterId, character);
    var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId, character.curTasks, character),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId, character.curTasks, character),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId, character.curTasks, character)
    });
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    character.curTasksEntity = curTasks || {};
}
*/
/**
 * Get all the information of a character, include equipments, package, skills, tasks.
 * @param {String} characterId
 * @param {function} cb
 */
userDao.getCharacterInfo = function (serverId, registerType, loginName, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    dbUtil.selectDb(redisConfig.database.SEAKING_REDIS_DB, function(client) {
        client.hget(key, "characters", function(err, characterId) {
            if(characterId == null || characterId == 0) {
                var result = null;

                redis.release(client);
                utils.invokeCallback(cb, {errCode:100}, result);
            } else {
                key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
                client.hgetall(key, function(err, replies) {
                    if(!replies.money) {
                        replies.money = 0;
                    }
                    if(!replies.gameCurrency) {
                        replies.gameCurrency = 0;
                    }
                    var cId = replies.cId;
                    var level = replies.level;
                    var character = playerUtil.getCharacter({
                        serverId: serverId,
                        characterId: characterId,
                        cId: cId,
                        registerType: registerType,
                        loginName: loginName,
                        level: level,
                        replies: replies
                    });

                    var taskInfo = {};
                    for(var o in character.curTasks) {
                        if(o == "currentDayTask") {
                            taskInfo = dataApi.task.findById(character.curTasks[o][0].taskId);
                            for(var o1 in taskInfo) {
                                character.curTasks[o][0][o1] = taskInfo[o1];
                            }
                        } else {
                            taskInfo = dataApi.task.findById(character.curTasks[o].taskId);
                            for(var o1 in taskInfo) {
                                character.curTasks[o][o1] = taskInfo[o1];
                            }
                        }
                    }

                    async.parallel([
                        function(callback) {
                           
                            partnerDao.getAllPartner(client, character.partners, serverId, registerType, loginName, characterId, function(err, partners) {
                                if(!!err || !partners) {
                                    console.log('Get partners for partnerDao failed! ' + err);
                                }
                                
                                callback(err, partners);
                            });
                        }
                    ],
                    function(err, results) {

                        var partners = results[0];
                        character.partners = partners; 
                        var player = playerUtil.getPlayer(character);
                        var fKey = dbUtil.getFriendKey(serverId, registerType, loginName, characterId);
                        userDao.logLogin(player, serverId, registerType, loginName, function(err, reply) {
                            friendDao.getFriends(fKey, function(err, reply) {
                                player.friends = reply;
                                utils.invokeCallback(cb, null, player);
                            });
                            redis.release(client);
                        });
                    });
                });
            }
        });
    });
};

/**
 * 获得指定角色信息
 * @param playerId
 * @param cb
 */
userDao.getPlayerById = function(playerId, cb) {
    var key = "";
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            key = playerId;
            client.get(key, function(err, reply) {
                if(reply == null) {
                    redis.release(client);
                    utils.invokeCallback(cb, {}, null);
                    return;
                }
                key = reply;
                var array = key.split("_");
                var serverId = array[0].replace("S", "");
                var registerType = array[1].replace("T", "");
                var loginName = array[2];
                var characterId = array[3].replace("C", "");
                client.hgetall(key, function(err, replies) {
                    if(!replies.money) {
                        replies.money = 0;
                    }
                    if(!replies.gameCurrency) {
                        replies.gameCurrency = 0;
                    }
                    var cId = replies.cId;
                    var level = replies.level;
                    var character = playerUtil.getPKCharacter({
                        serverId: serverId,
                        characterId: characterId,
                        cId: cId,
                        registerType: registerType,
                        loginName: loginName,
                        level: level,
                        replies: replies
                    });
                    async.parallel([
                        function(callback) {
                            partnerDao.getAllPartner(client, character.partners, character.serverId, character.registerType, character.loginName, characterId, function(err, partners) {
                                if(!!err || !partners) {
                                    console.log('Get partners for partnerDao failed! ' + err);
                                }
                                callback(err, partners);
                            });
                        }
                    ],
                    function(err, results) {
                        var Opponent = require('../domain/entity/opponent');
                        var partners = results[0];
                        var player = new Opponent(character);
                        player.partners = partners;
                        //var equipments = equipmentsDao.createNewEquipment(player.equipments, serverId, registerType, loginName, characterId, character);
                        //player.equipmentsEntity = equipments;
                        playerUtil.createPKEntity(player, serverId, registerType, loginName, characterId);
                        userDao.updateRoleData(player, serverId, registerType, loginName, function(err, reply) {
                            redis.release(client);
                            utils.invokeCallback(cb, null, player);
                        });
                    });
                });
            });
        }).exec(function(err, replies) {

        });
    });
};

/**
 * Get playerInfo by loginName
 * @param {String} loginName
 * @param {function} cb
 */
userDao.getUserByLoginName = function (serverId, registerType, loginName, cb) {
    dbUtil.selectDb(redisConfig.database.SEAKING_REDIS_DB, function(client) {
        var key = "S" + serverId + "_T" + registerType + "_" + loginName;
        client.exists(key, function(err, reply) {
            if (reply == 0) {
                redis.release(client);
                utils.invokeCallback(cb, message.notexists_loginName, null);
                return;
            } else {
                client.hgetall(key, function(err, userInfo) {
                    if(err !== null) {
                        redis.release(client);
                        utils.invokeCallback(cb, err.message, null);
                    } else {
                        var playerId = "S" + serverId + "C" + userInfo.characters;
                        redis.release(client);
                        utils.invokeCallback(cb, null, playerId);
                    }
                });
            }
        });
    });
};

/**
 * Update a player
 * @param {Object} player The player need to update
 * @param {function} cb Callback function.
 */
userDao.updatePlayer = function (player, field, cb) {
    var serverId = player.regionId;
    var registerType = player.registerType;
    var loginName = player.loginName;

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
            if(reply) {
                key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + reply;
                if(Object.prototype.toString.call(field) === '[object Array]') {
                    var obj = {};
                    var array = [];
                    for(var i = 0, l = field.length ; i < l ; i++) {
                        //array.push(["hset", key, field[i], player[field[i]]]);
                        dbUtil.getCommand(array, key, field[i], player);
                        obj[field[i]] = player[field[i]];
                    }
                    client.multi(array).exec(function(err, replies) {
                        redis.release(client);
                        utils.invokeCallback(cb, null, obj);
                    });
                } else {
                    var array = dbUtil.getFieldValue(field, player);
                    var _array = [];
                    for(var i = 0 ; i < array.length ; i++) {
                        _array.push(["hset", key, array[i].field, array[i].value]);
                    }
                    client.multi(_array).exec(function(err, replies) {
                        redis.release(client);
                        utils.invokeCallback(cb, null, player[field]);
                    });
                }
            } else {
                redis.release(client);
                utils.invokeCallback(cb, {
                    errCode: 101
                });
            }
        })
        .exec(function (err, replies) {

        });
    });
};

userDao.update = function(array, cb) {
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.multi(array).exec(function(err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, 1);
            });
        }).exec(function(err, reply) {

        });
    })
}

userDao.updatePlayerAttribute = function(player, cb) {
    var column = player.updateColumn().columns;
    var key = "S" + player.sid + "_T" + player.registerType + "_" + player.loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + player.sid + "_T" + player.registerType + "_" + player.loginName + "_C" + reply;

                    var array = [];
                    for(var o in column) {
                        dbUtil.getCommand(array, key, o, player);
                    }
                    client.multi(array).exec(function(err, replies) {
                        redis.release(client);
                        utils.invokeCallback(cb, null, column);
                    });
                }
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 * 升级
 * @param player
 * @param cb
 */
userDao.upgrade = function(player, columns, cb) {
    var characterId = userDao.getRealCharacterId(player.id);

    var column = columns;
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            var array = [];
            for(var o in column) {
                array.push(["hset", key, o, column[o]]);
                player[o] = column[o];
            }
            client.multi(array).exec(function(err, replies) {
                redis.release(client);
                utils.invokeCallback(cb, null, column);
            });
        }).exec(function (err, replies) {

            });
    });
}

/**
 * 进入场景
 * @param serverId
 * @param registerType
 * @param loginName
 * @param sceneId
 * @param cb
 */
userDao.enterScene = function(serverId, registerType, loginName, sceneId, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + reply;
                    client.hset(key, "currentScene", sceneId, function(err, reply) {
                        redis.release(client);
                    });
                    utils.invokeCallback(cb, null, sceneId);
                } else {
                    redis.release(client);
                    utils.invokeCallback(cb, {
                        errCode: 101
                    });
                }
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 * 进入副本
 * @param serverId
 * @param registerType
 * @param loginName
 * @param sceneId
 * @param cb
 */
userDao.enterIndu = function(serverId, registerType, loginName, induId, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + reply;

                    client.hget(key, "currentIndu", function(err, reply) {
                        var currentIndu = JSON.parse(reply);

                        /*if(currentIndu.induId == induId) {
                            redis.release(client);
                            utils.invokeCallback(cb, null, currentIndu);
                        } else {*/
                            var induData = dataApi.instancedungeon.findById(induId);
                            if(induData) {
                                var date = new Date();

                                currentIndu.induId = induId;
                                currentIndu.induData = induData.induData;
                                currentIndu.enterDate = date.getTime();
                                client.hset(key, "currentIndu", JSON.stringify(currentIndu), function(err, reply) {
                                    redis.release(client);
                                    utils.invokeCallback(cb, null, currentIndu);
                                });
                            } else {
                                redis.release(client);
                                utils.invokeCallback(cb, {
                                    errCode: 101
                                });
                            }
                        //}
                    });
                } else {
                    redis.release(client);
                    utils.invokeCallback(cb, {
                        errCode: 101
                    });
                }
            })
            .exec(function (err, replies) {

            });
    });
}

/**
 * 保存玩家副本信息
 * @param serverId
 * @param registerType
 * @param loginName
 * @param cb
 */
userDao.updatePlayerInduInfo = function(player, eid, cb) {
    var characterId = userDao.getRealCharacterId(player.id);

    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.hget(key, "currentIndu", function(err, reply) {
                var currentIndu = JSON.parse(reply);
                if(currentIndu.induId == player.currentIndu.induId) {
                    var induData = player.currentIndu.induData;

                    for(var i = 0 ; i < induData.length ; i++) {
                        if(induData[i] == null)
                            continue;
                        if(induData[i].eventId == eid) {
                            induData[i].died = true;
                            break;
                        }
                    }
                    player.currentIndu.induData = currentIndu.induData = induData;
                    client.hset(key, "currentIndu", JSON.stringify(currentIndu), function(err, reply) {
                        redis.release(client);
                        utils.invokeCallback(cb, null, currentIndu);
                    });
                } else {
                    redis.release(client);
                    utils.invokeCallback(cb, {
                        errCode: 101
                    })
                }
            });
        }).exec(function (err, replies) {

        });
    });
}

/**
 * 离开副本
 * @param serverId
 * @param registerType
 * @param loginName
 * @param induId
 * @param cb
 */
userDao.leaveIndu = function(serverId, registerType, loginName, induId, cb) {
    var key = "S" + serverId + "_T" + registerType + "_" + loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, characterId) {
                if(characterId) {
                    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId)

                    client.hget(key, "currentIndu", function(err, reply) {
                        var currentIndu = JSON.parse(reply);
                        if(currentIndu.induId == induId) {
                            var _currentIndu = {
                                induId: 0
                            };
                            client.hset(key, "currentIndu", JSON.stringify(_currentIndu));
                            var date = new Date();
                            var isFinished = 1;
                            for(var i = 0 ; i < currentIndu.induData.length ; i++) {
                                if(!currentIndu.induData.isDie || currentIndu.induData.isDie == false) {
                                    isFinished = 0;
                                    break;
                                }
                            }
                            // induDao.logData(redis, client, serverId, registerType, loginName, characterId, induId, currentIndu, isFinished);
                            var logData = induDao.getLogData(serverId, registerType, loginName, characterId, induId, currentIndu, isFinished);
                            ucenter.saveInduLog(logData);

                            redis.release(client);
                            utils.invokeCallback(cb, null, _currentIndu);
                        } else {//不是同一个副本
                            redis.release(client);
                            utils.invokeCallback(cb, {
                                errCode: 101
                            });
                        }
                    });

                } else {
                    redis.release(client);
                    utils.invokeCallback(cb, {
                        errCode: 101
                    });
                }
            })
            .exec(function (err, replies) {

            });
    });
}

userDao.enterCity = function(serverId, registerType, loginName, cityId, cb) {
    userDao.enterScene(serverId, registerType, loginName, cityId, cb);
}

/**
 * 更新角色金钱和经验
 */
userDao.updateMoneyAndExp = function(data, cb) {
    var key = "S" + data.serverId + "_T" + data.registerType + "_" + data.loginName;
    dbUtil.selectDb(redisConfig.database.SEAKING_REDIS_DB, function(client) {
        client.hget(key, "characters", function(err, reply) {
            if(reply == 0) {
                redis.release(client);
                utils.invokeCallback(cb, {
                    errCode: 101
                });
            } else {
                key = "S" + data.serverId + "_T" + data.registerType + "_" + data.loginName + "_C" + reply;
                client.hgetall(key, function(err, replies) {
                    var money = replies.money;
                    var experience = replies.experience;
                    var currentLevel = Math.floor(replies.experience / 200);
                    if(money) {
                        money = parseInt(money) + parseInt(data.money);
                    } else {
                        money = parseInt(data.money);
                    }
                    if(experience) {
                        experience = parseInt(experience) + parseInt(data.experience);
                    } else {
                        experience = parseInt(data.experience);
                    }
                    var level = Math.floor(experience / 200);
                    var isLevelUp = 0;
                    if(level > currentLevel) {
                        isLevelUp = 1;
                        /*var result = {
                         status: "200",
                         loginName: "wozlla",
                         message: "恭喜您升到" + level + "级了"
                         };
                         socket.emit("1606", result);
                         socket.broadcast.emit("1606", result);*/
                    }
                    client.hset(key, "money", money, redis.print);
                    client.hset(key, "experience", experience, redis.print);
                    var result = {
                        money: money,
                        experience: experience,
                        isLevelUp: isLevelUp,
                        level: level,
                        needExp: 200 * (level + 1)
                    };
                    redis.release(client);
                    utils.invokeCallback(cb, null, result);
                });
            }
        });
    });
};
