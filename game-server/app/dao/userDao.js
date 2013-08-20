/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: userDao
 */
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var Opponent = require('../domain/entity/opponent');
var Tasks = require('../domain/tasks');
var User = require('../domain/user');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var packageDao = require('./packageDao');
var fightskillDao = require('./fightskillDao');
var taskDao = require('./taskDao');
var partnerDao = require('./partnerDao');
var playerDao = require('./playerDao');
var async = require('async');
var utils = require('../util/utils');
var dbUtil = require('../util/dbUtil');
var message = require('../i18n/zh_CN.json');
var formula = require('../consts/formula');
var redis  = require("redis");
var area = require('../domain/area/area');

var userDao = module.exports;

userDao.login = function (registerType, loginName, password, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "T" + registerType + "_" + loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.UC_USER_REDIS_DB, function() {

        }).hgetall(key, function(err, reply) {
                if(reply.password == password) {
                    utils.invokeCallback(cb, null, reply);
                } else {
                    utils.invokeCallback(cb, {
                        errCode: 101
                    });
                }
            })
            .exec(function (err, replies) {

            });
    });
};

/**
 * Get user data by loginName.
 * @param {Number} serverId
 * @param {Number} registerType
 * @param {String} loginName
 * @param {function} cb
 */
userDao.getUserInfo = function (serverId, registerType, loginName, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;

    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).hgetall(key, function(err, reply) {
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
 */
userDao.logLogin = function(player, serverId, registerType, loginName, cb) {
    userDao.getUserInfo(serverId, registerType, loginName, function(err, reply) {
        var date = new Date();
        var lastLoginDate = date.getTime();
        if(typeof reply.lastLoginDate != "undefined")
            lastLoginDate = reply.lastLoginDate;

        var time = date.getTime() - lastLoginDate;
        time = Math.floor(time / 1000);
        playerDao.appPlayerAndPartnersHP(player, time, cb);

        var userInfo = {
            lastLoginDate: date.getTime()
        };
        userDao.saveUserInfo(userInfo, serverId, registerType, loginName, function(err, reply) {

        });
    });
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
 * 记录在线玩家
 */
userDao.addOnlineUser = function(serverId, registerType, loginName, cb) {

}

/**
 * 删除在线玩家
 */
userDao.removeOnlineUser = function(serverId, registerType, loginName, cb) {

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
        gameCurrency: 0,
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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {
            var array = [];
            for(var o in userInfo) {
                array.push(["hset", key, o, userInfo[o]]);
            }
            client.multi(array).exec(function(err, replies) {
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
userDao.getCharactersByLoginName = function(app, serverId, registerType, loginName, cb) {
    userDao.getCharacterAllInfo(serverId, registerType, loginName, 0, function(err, character) {
        var array = [];
        array.push(character);
        utils.invokeCallback(cb, null, array);
    });
};

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param app
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
userDao.is_exists_nickname = function(app, serverId, nickname, next) {
    var key = "S" + serverId + "_exist_nickname";
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).sismember(key, nickname, function(err, reply) {
            next(reply);
        })
        .exec(function (err, replies) {

        });
    });
}

/**
 * 根据昵称判断是否存在该玩家，玩家昵称不可以重复
 * @param app
 * @param serverId
 * @param registerType
 * @param nickName
 * @param cb
 */
userDao.has_nickname_player = function(app, serverId, nickname, next) {
    var key = "S" + serverId + "_N" + nickname;
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).exists(key, function(err, reply) {
                next(reply);
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
    var player = area.getPlayer(playerId);
    if(player != null){
        utils.invokeCallback(cb,null,player.nickname);
    }else{
        var redisConfig = pomelo.app.get('redis');
        var redis = pomelo.app.get('redisclient');
        redis.command(function(client) {
            client.multi().select(redisConfig.database.SEAKING_REDIS_DB,function(){

            }).get(playerId,function(err,reply) {
                    if(!!err){
                        utils.invokeCallback(cb,"不存在playerId");
                        return;
                    }
                    client.hget(reply,"nickname",function(err,reply) {
                        if(!!err){
                            utils.invokeCallback(cb,err);
                            return;
                        }
                        utils.invokeCallback(cb,null,reply);
                    });
                }).exec(function(err,reply) {

                });
        });
    }
}

/**
 * 通过nickname查找到id
 * @param serverId
 * @param nickname
 * @param cb
 */
userDao.getPlayerIdByNickname=function(serverId, nickname, cb) {
    var key = "S" + serverId + "_N" + nickname;
    //使用pomelo的app还是函数传来的app
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function() {

        }).get(key, function(err, reply) {
            client.hget(reply, "id", function(err, reply) {
                if(!!err) {
                    utils.invokeCallback(cb, null);
                    return;
                }
                utils.invokeCallback(cb, null, reply);
            });
        }).exec(function (err, replies) {

        });
    });
}

/**
 * Get an user's all players by userId
 * @param {Number} characterId
 * @param {function} cb Callback function.
 */
userDao.getPlayer = function(characterId, cb){

};

/**
 * 創建角色
 */
userDao.createCharacter = function(serverId, userId, registerType, loginName, cId, nickname, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;// 先判断是否已创建角色
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hexists(key, "characters", function(err, reply) {
            if(reply == 0) {
                userDao.getCharacterId(client, function(err, characterId) {
                    var level = 0;
                    var hero = dataApi.heros.findById(cId);
                    var date = new Date();
                    var curTasks = {
                        currentMainTask: {"taskId": 10100, "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
                        currentBranchTask: {"taskId": 20201, "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()},
                        currentDayTask: [{"taskId": 30201,"status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}, {"taskId": 30202}, {"taskId": 30203}],
                        currentExerciseTask: {"taskId": 40201, "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}
                    };
                    var character = {
                        id: "S" + serverId + "C" + characterId,
                        characterId: "S" + serverId + "C" + characterId,
                        cId: cId,
                        userId: userId,
                        serverId: serverId,
                        registerType: registerType,
                        loginName: loginName,
                        nickname: nickname,
                        currentScene: "city01",
                        x: 1000,
                        y: 100,
                        experience: 0,
                        level: level,
                        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, level + 1),
                        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
                        photo: '',
                        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
                        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
                        anger: 0,
                        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), level),
                        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), level),
                        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), level),
                        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
                        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
                        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), level),
                        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), level),
                        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), level),
                        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), level),
                        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), level),
                        gameCurrency: 100,
                        money: 100,
                        equipments: {
                            weapon: {
                                epid: 0,
                                level: 0
                            },//武器

                            necklace: {
                                epid: 0,
                                level: 0
                            },//项链
                            helmet: {
                                epid: 0,
                                level: 0
                            },//头盔
                            armor: {
                                epid: 0,
                                level: 0
                            },//护甲
                            belt: {
                                epid: 0,
                                level: 0
                            },//腰带
                            legguard: {
                                epid: 0,
                                level: 0
                            },//护腿
                            amulet: {
                                epid: 0,
                                level: 0
                            },//护符
                            shoes: {
                                epid: 0,
                                level: 0
                            },//鞋
                            ring: {
                                epid: 0,
                                level: 0
                            }//戒指
                        },
                        package: {
                            weapons: {
                                itemCount: 9,
                                items: {}
                            },
                            equipments: {
                                itemCount: 9,
                                items: {}
                            },
                            items: {
                                itemCount: 9,
                                items: {}
                            }
                        },
                        skills: {
                            activeSkills: [],
                            passiveSkills: []
                        },
                        formation: [{playerId:"S" + serverId + "C" + characterId},null,null,null,null,null,null],
                        partners: [],
                        gift: [],
                        curTasks: curTasks,
                        currentIndu: {"induId":0}
                    };

                    client.hset(key, "characters", characterId);
                    userDao.initUserInfo(userId, serverId, registerType, loginName, function(err, reply) {

                    });

                    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);

                    var array = dbUtil.getMultiCommand(key, character);
                    dbUtil.saveNickname(array, serverId, nickname);
                    dbUtil.savePlayerIdToCharacter(array, character.id, key);
                    dbUtil.saveNicknameToCharacter(array, serverId, nickname, key);
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

                        var player = new Player({
                            userId: character.userId,
                            serverId: character.serverId,
                            registerType: character.registerType,
                            loginName: character.loginName,
                            id: character.characterId,
                            cId: character.cId,
                            kindId: character.cId,
                            currentScene: character.currentScene,
                            x: character.x,
                            y: character.y,
                            nickname: character.nickname,
                            level: character.level,
                            experience: character.experience,
                            hp: character.hp,
                            maxHp: character.maxHp,
                            anger: character.anger,
                            attack: character.attack,
                            defense: character.defense,
                            focus: character.focus,
                            speedLevel: character.speedLevel,
                            speed: character.speed,
                            dodge: character.dodge,
                            criticalHit: character.criticalHit,//暴击
                            critDamage: character.critDamage,//暴击
                            block: character.block,
                            counter: character.counter,
                            gameCurrency: character.gameCurrency,
                            money: character.money,
                            equipments: character.equipments,
                            curTasks: character.curTasks,
                            package: character.package,
                            skills: character.skills,
                            formation: character.formation,
                            partners: character.partners,
                            gift: character.gift,
                            currentIndu: character.currentIndu
                        });
                        createEPTInfo(player, serverId, registerType, loginName, characterId);
                        utils.invokeCallback(cb, null, player);
                    });
                });
            } else {
                //userDao.getCharacterInfo(serverId, registerType, loginName, cb);
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
                    logger.error('Get user for userDao failed! ' + err);
                }
                characterId = character.id;
                //var characterId = userDao.getRealCharacterId(characterId);
                callback(err, character);
            });
        }
    ],
    function(err, results) {
        var character = results[0];
        createEPTInfo(character, serverId, registerType, loginName, characterId);

        if(typeof needCalculateWeapon != "undefined" && needCalculateWeapon == true)
            character.updateAttribute();

        if (!!err) {
            utils.invokeCallback(cb, err);
        } else {
            utils.invokeCallback(cb, null, character);
        }
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
function createEPTInfo(character, serverId, registerType, loginName, characterId) {
    var equipments = equipmentsDao.createNewEquipment(character.equipments, serverId, registerType, loginName, characterId);
    var package = packageDao.createNewPackage(character.package, serverId, registerType, loginName, characterId);
    var curTasks = new Tasks({
        currentMainTask: taskDao.createNewTask(character.curTasks.currentMainTask, serverId, registerType, loginName, characterId),
        currentBranchTask: taskDao.createNewTask(character.curTasks.currentBranchTask, serverId, registerType, loginName, characterId),
        currentDayTask: taskDao.createNewTask(character.curTasks.currentDayTask[0], serverId, registerType, loginName, characterId),
        currentExerciseTask: taskDao.createNewTask(character.curTasks.currentExerciseTask, serverId, registerType, loginName, characterId)
    });
    character.packageEntity = package;
    character.equipmentsEntity = equipments;
    character.curTasksEntity = curTasks || {};
}

/**
 * Get all the information of a character, include equipments, package, skills, tasks.
 * @param {String} characterId
 * @param {function} cb
 */
userDao.getCharacterInfo = function (serverId, registerType, loginName, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    dbUtil.selectDb(redisConfig.database.SEAKING_REDIS_DB, function(client) {
        client.hget(key, "characters", function(err, characterId) {
            if(characterId == null) {
                var result = null;
                utils.invokeCallback(cb, null, result);
            } else {
                key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
                client.hgetall(key, function(err, replies) {
                    console.log(replies);
                    if(!replies.money) {
                        replies.money = 0;
                    }
                    if(!replies.gameCurrency) {
                        replies.gameCurrency = 0;
                    }
                    var cId = replies.cId;
                    var level = replies.level;
                    var hero = dataApi.heros.findById(cId);
                    var character = {
                        id: "S" + serverId + "C" + characterId,
                        characterId: "S" + serverId + "C" + characterId,
                        cId: cId,
                        userId: replies.userId,
                        serverId: serverId,
                        registerType: registerType,
                        loginName: loginName,
                        nickname: replies.nickname,
                        currentScene: replies.currentScene,
                        x: parseInt(replies.x),
                        y: parseInt(replies.y),
                        experience: parseInt(replies.experience),
                        level: parseInt(level),
                        needExp: parseInt(replies.needExp),
                        accumulated_xp: parseInt(replies.accumulated_xp),
                        photo: replies.photo,
                        hp: parseInt(replies.hp),
                        maxHp: parseInt(replies.maxHp),
                        anger: parseInt(replies.anger),
                        attack: parseInt(replies.attack),
                        defense: parseInt(replies.defense),
                        focus: parseFloat(replies.focus),
                        speedLevel: parseInt(replies.speedLevel),
                        speed: parseFloat(replies.speed),
                        dodge: parseFloat(replies.dodge),
                        criticalHit: parseFloat(replies.criticalHit),
                        critDamage: parseFloat(replies.critDamage),
                        block: parseFloat(replies.block),
                        counter: parseFloat(replies.counter),
                        gameCurrency: parseInt(replies.gameCurrency),
                        money: parseInt(replies.money),
                        equipments: JSON.parse(replies.equipments),
                        package: JSON.parse(replies.package),
                        skills: {
                            activeSkills: JSON.parse(replies.activeSkills),
                            passiveSkills: JSON.parse(replies.passiveSkills)
                        },
                        formation: JSON.parse(replies.formation).formation,
                        partners: JSON.parse(replies.partners).partners,
                        gift: JSON.parse(replies.gift).gift,
                        curTasks: {
                            currentMainTask: JSON.parse(replies.currentMainTask),
                            currentBranchTask: JSON.parse(replies.currentBranchTask),
                            currentDayTask: JSON.parse(replies.currentDayTask),
                            currentExerciseTask: JSON.parse(replies.currentExerciseTask)
                        },
                        currentIndu: JSON.parse(replies.currentIndu)
                    };
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
                    logger.info(character.partners);
                    async.parallel([
                        function(callback) {
                            partnerDao.getAllPartner(client, character.partners, serverId, registerType, loginName, characterId, function(err, partners) {
                                if(!!err || !partners) {
                                    logger.error('Get partners for partnerDao failed! ' + err);
                                }
                                callback(err, partners);
                            });
                        }
                    ],
                    function(err, results) {
                        var partners = results[0];
                        var player = new Player({
                            userId: character.userId,
                            serverId: character.serverId,
                            registerType: character.registerType,
                            loginName: character.loginName,
                            id: character.characterId,
                            cId: character.cId,
                            kindId: character.cId,
                            currentScene: character.currentScene,
                            x: character.x,
                            y: character.y,
                            nickname: character.nickname,
                            level: character.level,
                            experience: character.experience,
                            hp: character.hp,
                            maxHp: character.maxHp,
                            anger: character.anger,
                            attack: character.attack,
                            defense: character.defense,
                            focus: character.focus,
                            speedLevel: character.speedLevel,
                            speed: character.speed,
                            dodge: character.dodge,
                            criticalHit: character.criticalHit,//暴击
                            critDamage: character.critDamage,//暴击
                            block: character.block,
                            counter: character.counter,
                            gameCurrency: character.gameCurrency,
                            money: character.money,
                            equipments: character.equipments,
                            curTasks: character.curTasks,
                            package: character.package,
                            skills: character.skills,
                            formation: character.formation,
                            partners: partners,
                            gift: character.gift,
                            currentIndu: character.currentIndu
                        });
                        userDao.logLogin(player, serverId, registerType, loginName, function(err, reply) {
                            utils.invokeCallback(cb, null, player);
                        });
                    });
                });
            }
        });
    });
};

userDao.getPlayerById = function(playerId, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "";
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            key = playerId;
            client.get(key, function(err, reply) {
                key = reply;
                var array = key.split("_");
                var serverId = array[0].replace("S", "");
                var registerType = array[1].replace("T", "");
                var loginName = array[2];
                var characterId = array[3].replace("C", "");
                client.hgetall(key, function(err, replies) {
                    console.log(replies);
                    if(!replies.money) {
                        replies.money = 0;
                    }
                    if(!replies.gameCurrency) {
                        replies.gameCurrency = 0;
                    }
                    var cId = replies.cId;
                    var level = replies.level;
                    var hero = dataApi.heros.findById(cId);
                    var character = {
                        id: "S" + serverId + "C" + characterId,
                        characterId: "S" + serverId + "C" + characterId,
                        cId: cId,
                        userId: replies.userId,
                        serverId: serverId,
                        registerType: registerType,
                        loginName: loginName,
                        nickname: replies.nickname,
                        currentScene: replies.currentScene,
                        x: parseInt(replies.x),
                        y: parseInt(replies.y),
                        experience: parseInt(replies.experience),
                        level: parseInt(level),
                        needExp: parseInt(replies.needExp),
                        accumulated_xp: parseInt(replies.accumulated_xp),
                        photo: replies.photo,
                        hp: parseInt(replies.hp),
                        maxHp: parseInt(replies.maxHp),
                        anger: parseInt(replies.anger),
                        attack: parseInt(replies.attack),
                        defense: parseInt(replies.defense),
                        focus: parseFloat(replies.focus),
                        speedLevel: parseInt(replies.speedLevel),
                        speed: parseFloat(replies.speed),
                        dodge: parseFloat(replies.dodge),
                        criticalHit: parseFloat(replies.criticalHit),
                        critDamage: parseFloat(replies.critDamage),
                        block: parseFloat(replies.block),
                        counter: parseFloat(replies.counter),
                        gameCurrency: parseInt(replies.gameCurrency),
                        money: parseInt(replies.money),
                        equipments: JSON.parse(replies.equipments),
                        skills: {
                            activeSkills: JSON.parse(replies.activeSkills),
                            passiveSkills: JSON.parse(replies.passiveSkills)
                        },
                        formation: JSON.parse(replies.formation).formation,
                        partners: JSON.parse(replies.partners).partners
                    };
                    logger.info(character.partners);
                    async.parallel([
                        function(callback) {
                            partnerDao.getAllPartner(client, character.partners, character.serverId, character.registerType, character.loginName, characterId, function(err, partners) {
                                if(!!err || !partners) {
                                    logger.error('Get partners for partnerDao failed! ' + err);
                                }
                                callback(err, partners);
                            });
                        }
                    ],
                    function(err, results) {
                        var partners = results[0];
                        var player = new Opponent(character);
                        player.partners = partners;
                        userDao.logLogin(player, serverId, registerType, loginName, function(err, reply) {
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
 * Get userInfo by loginName
 * @param {Object} app
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByLoginName = function (app, registerType, loginName, cb) {
    var redisConfig = app.get('redis');
    dbUtil.selectDb(redisConfig.database.UC_USER_REDIS_DB, function(client) {
        var key = "T" + registerType + "_" + loginName;
        client.exists(key, function(err, reply) {
            if (reply == 0) {
                utils.invokeCallback(cb, message.notexists_loginName, null);
                return;
            } else {
                client.hgetall(key, function(err, userInfo) {
                    if(err !== null) {
                        utils.invokeCallback(cb, err.message, null);
                    } else {
                        console.log(userInfo);
                        var user = new User({
                            id: userInfo.userId,
                            registerType: userInfo.registerType,
                            loginName: userInfo.loginName,
                            password: userInfo.password
                        });
                        utils.invokeCallback(cb, null, user);
                    }
                });
            }
        });
    });
};

/**
 * delete user by username
 * @param {String} username
 * @param {function} cb Call back function.
 */
userDao.deleteUserByName = function (username, cb) {

};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function (username, password, from, cb){

};

/**
 * Create a new player
 * @param {String} uid User id.
 * @param {String} name Player's name in the game.
 * @param {Number} roleId Player's roleId, decide which kind of player to create.
 * @param {function} cb Callback function
 */
userDao.createMainPlayer = function (uid, name, cId, cb) {

};

/**
 * Update a player
 * @param {Object} player The player need to update
 * @param {function} cb Callback function.
 */
userDao.updatePlayer = function (player, field, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var serverId = player.regionId;
    var registerType = player.registerType;
    var loginName = player.loginName;

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    logger.info(key);
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
                        utils.invokeCallback(cb, null, obj);
                    });
                } else {
                    var array = dbUtil.getFieldValue(field, player);
                    for(var i = 0 ; i < array.length ; i++) {
                        client.hset(key, array[i].field, array[i].value);
                    }
                    utils.invokeCallback(cb, null, player[field]);
                }
            } else {
                utils.invokeCallback(cb, {
                    errCode: 101
                });
            }
        })
        .exec(function (err, replies) {

        });
    });
};

userDao.updatePlayerAttribute = function(player, cb) {
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var column = player.updateColumn().columns;
    var key = "S" + player.sid + "_T" + player.registerType + "_" + player.loginName;
    logger.info(key);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + player.sid + "_T" + player.registerType + "_" + player.loginName + "_C" + reply;
                    logger.info(column);

                    var array = [];
                    for(var o in column) {
                        array.push(["hset", key, o, column[o]]);
                    }
                    client.multi(array).exec(function(err, replies) {
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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var characterId = userDao.getRealCharacterId(player.id);

    var column = columns;
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    logger.info(key);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            var array = [];
            for(var o in column) {
                array.push(["hset", key, o, column[o]]);
                player[o] = column[o];
            }
            client.multi(array).exec(function(err, replies) {
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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + reply;
                    client.hset(key, "currentScene", sceneId);
                    utils.invokeCallback(cb, null, sceneId);
                } else {
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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    logger.info(key);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, reply) {
                if(reply) {
                    key = "S" + serverId + "_T" + registerType + "_" + loginName + "_C" + reply;
                    logger.info(key);
                    client.hget(key, "currentIndu", function(err, reply) {
                        logger.info(reply);
                        var currentIndu = JSON.parse(reply);
                        logger.info(currentIndu);
                        if(currentIndu.induId == induId) {

                        } else {
                            var induData = dataApi.instancedungeon.findById(induId);
                            var date = new Date();
                            logger.info(induData);
                            currentIndu.induId = induId;
                            currentIndu.induData = induData.induData;
                            currentIndu.enterDate = date.getTime();
                            client.hset(key, "currentIndu", JSON.stringify(currentIndu));
                        }
                        utils.invokeCallback(cb, null, currentIndu);
                    });

                } else {
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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var characterId = userDao.getRealCharacterId(player.id);

    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);
    logger.info(key);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {
            client.hget(key, "currentIndu", function(err, reply) {
                logger.info(reply);
                var currentIndu = JSON.parse(reply);
                logger.info(currentIndu);
                if(currentIndu.induId == player.currentIndu.induId) {
                    var induData = player.currentIndu.induData;
                    logger.info(induData);
                    for(var i = 0 ; i < induData.length ; i++) {
                        if(induData[i] == null)
                            continue;
                        if(induData[i].eventId == eid) {
                            induData[i].died = true;
                            break;
                        }
                    }
                    player.currentIndu.induData = currentIndu.induData = induData;
                    client.hset(key, "currentIndu", JSON.stringify(currentIndu));
                    utils.invokeCallback(cb, null, currentIndu);
                } else {
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
    var redisConfig = pomelo.app.get('redis');
    var redis = pomelo.app.get('redisclient');

    var key = "S" + serverId + "_T" + registerType + "_" + loginName;
    logger.info(key);
    redis.command(function(client) {
        client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function(err, reply) {

        }).hget(key, "characters", function(err, characterId) {
                if(characterId) {
                    key = dbUtil.getPlayerKey(serverId, registerType, loginName, characterId)
                    logger.info(key);
                    client.hget(key, "currentIndu", function(err, reply) {
                        logger.info(reply);
                        var currentIndu = JSON.parse(reply);
                        logger.info(currentIndu);;
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
                            var induLog = {
                                registerType: registerType,
                                loginName: loginName,
                                characterId: characterId,
                                induId: induId,
                                induData: currentIndu.induData,
                                date: date.getTime(),
                                enterDate: currentIndu.enterDate,
                                finishDate: date.getTime(),
                                isFinished: isFinished
                            };
                            key = key + "_" + induId;
                            client.lpush(key, JSON.stringify(induLog));

                            utils.invokeCallback(cb, null, _currentIndu);
                        } else {//不是同一个副本
                            utils.invokeCallback(cb, {
                                errCode: 101
                            });
                        }
                    });

                } else {
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
userDao.updateMoneyAndExp = function(data) {
    var key = "S" + data.serverId + "_T" + data.registerType + "_" + data.loginName;
    dbUtil.selectDb(redisConfig.database.SEAKING_REDIS_DB, function(client) {
        client.hget(key, "characters", function(err, reply) {
            if(reply == 0) {
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
                    utils.invokeCallback(cb, null, result);
                });
            }
        });
    });
};

/**
 * Delete player
 * @param {Number} characterId
 * @param {function} cb Callback function.
 */
userDao.deletePlayer = function (characterId, cb){

};