/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var gmDao = require('../dao/gmDao');
var utils = require('../utils/utils');
var dbUtil = require('../utils/dbUtil');
var dataApi = require('../utils/dataApi');
var consts = require('../consts/consts');

var gmService = module.exports;

/**
 * 重置任务
 */
gmService.resetTask = function(type, taskId, cb) {
    gmDao.resetTask(type, taskId, cb);
}

/**
 * 更新金币
 */
gmService.updateMoney = function(money, cb) {
    gmDao.updateMoney(money, cb);
}

/**
 * 更新经验
 */
gmService.updateExp = function(exp, cb) {
    gmDao.updateExp(exp, cb);
}

/**
 * initCharacter
 * @param array
 * @param player
 */
gmService.initCharacter = function(array, player) {
    gmService.initGhost(array, player);
    gmService.initAptitude(array, player);
    gmService.initPackage(array, player);
    //gmService.initStrengthen(array, player);
    //gmService.initForge(array, player);
    //gmService.initInlay(array, player);
    gmService.initEquipment(array, player);
    gmService.initFormation(array, player);
    gmService.initStarAccumulate(array, player);
    gmService.initTask(array, player);
    gmService.initEmail(array, player);
    gmService.initFriend(array, player);
}

/**
 * 初始化命魂
 * @param array
 * @param player
 */
gmService.initGhost = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    array.push(["hset", key, "ghostNum", 0]);

    var field = "ghost";
    var ghost = {
        level: 0
    };
    var value = JSON.stringify(ghost);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化资质
 * @param array
 * @param player
 */
gmService.initAptitude = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "aptitude";

    var heroId = utils.getCategoryHeroId(player.cId);
    var aptitudes = dataApi.aptitudes.findById(heroId).aptitudes;

    var data = {};
    for(var i in aptitudes) {
        data[aptitudes[i]] = {"level":0,"count":50};
    }
    data.count = 250;
    data.upgradeDate = 1;
    data.upgradeTimeOneDay = 0;

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化背包
 * @param array
 * @param player
 */
gmService.initPackage = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "package";

    player.packageEntity.clearPackage();

    var data = player.packageEntity.getInfo();

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 *
 * @param array
 * @param player
 */
gmService.initEquipment = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "equipments";

    player.equipmentsEntity.initStrengthen(player);
    player.equipmentsEntity.initForgeForEquipment(player);
    player.equipmentsEntity.initInlayForEquipment(player);

    var data = player.equipmentsEntity.getInfo();

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化强化
 * @param array
 * @param player
 */
gmService.initStrengthen = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "equipments";

    player.equipmentsEntity.initStrengthen(player);

    var data = player.equipmentsEntity.getInfo();

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化打造
 * @param array
 * @param player
 */
gmService.initForge = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "equipments";

    player.equipmentsEntity.initForgeForEquipment(player);

    var data = player.equipmentsEntity.getInfo();

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化镶嵌
 * @param array
 * @param player
 */
gmService.initInlay = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "equipments";

    player.equipmentsEntity.initInlayForEquipment(player);

    var data = player.equipmentsEntity.getInfo();

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化阵型
 * @param array
 * @param player
 */
gmService.initFormation = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "formation";
    var data = player.formationEntity.initFormation();
    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);

    field = "lastFormation";
    value = JSON.stringify(data);
    array.push(["hset", key, field, value]);

    field = "tacticals";
    data = player.formationEntity.initTacticals();
    value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化星蕴
 * @param array
 * @param player
 */
gmService.initStarAccumulate = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var field = "ZX";

    var defaultZX = function(level) {
        var i = [], c = 0;
        if(level < 25) {

        } else if(level < 55) {
            c = parseInt((level - 25) / 5) + 3;
        } else {
            c = 9;
        }
        return {
            i: i,
            c: c
        };
    }

    var data = defaultZX(player.level);

    var value = JSON.stringify(data);
    array.push(["hset", key, field, value]);
}

/**
 * 初始化任务
 * @param array
 * @param player
 */
gmService.initTask = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    player.curTasksEntity.initTask();

    var tasks = player.curTasksEntity.strip();
    var value = {};
    var task = {};
    for (var type in tasks) {
        task = tasks[type].strip();
        key = dbUtil.getPlayerKey(task.serverId, task.registerType, task.loginName, task.characterId);
        value = {
            taskId: task.taskId,
            status: task.status,
            startTime: task.startTime,
            finishTime: task.finishTime,
            taskRecord: task.taskRecord,
            handOverTime: task.handOverTime
        };
        if(typeof value.startTime == "undefined" || value.startTime == null) {
            value.startTime = 0;
        }
        if(typeof value.finishTime == "undefined" || value.finishTime == null) {
            value.finishTime = 0;
        }
        if(typeof value.taskRecord == "undefined" || value.taskRecord == null) {
            value.taskRecord = {};
        }
        if(typeof value.handOverTime == "undefined" || value.handOverTime == null) {
            value.handOverTime = 0;
        }
        if(type == consts.curTaskType.CURRENT_DAY_TASK) {
            var temp = player.curTasks[type];
            temp[0] = value;
            value = temp;
        }
        array.push(["hset", key, type, JSON.stringify(value)]);
    }
}

/**
 * 初始化邮件
 * @param array
 * @param player
 */
gmService.initEmail = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getPlayerKey(player.sid, player.registerType, player.loginName, characterId);

    var mailIn = key + "_" + consts.MailKeyType.MAILIN;
    array.push(["del", mailIn]);

    var mailOut = key + "_" + consts.MailKeyType.MAILOUT;
    array.push(["del", mailOut]);
}

/**
 * 初始化好友
 * @param array
 * @param player
 */
gmService.initFriend = function(array, player) {
    var characterId = utils.getRealCharacterId(player.id);
    var key = dbUtil.getFriendKey(player.sid, player.registerType, player.loginName, characterId);
    array.push(["del", key]);
}