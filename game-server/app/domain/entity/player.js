/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: player
 */
/**
 * Module dependencies
 */
var util = require('util');
var dataApi = require('../../util/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var TaskType = require('../../consts/consts').TaskType;
var TaskStatus = require('../../consts/consts').TaskStatus;
var Character = require('./character');
var userDao = require('../../dao/userDao');
var playerDao = require('../../dao/playerDao');
var fightskillDao = require('../../dao/fightskillDao');
var taskDao = require('../../dao/taskDao');
var fightskill = require('./../fightskill');
var logger = require('pomelo-logger').getLogger(__filename);
var area = require('./../area/area');
var utils = require('../../util/utils');

/**
 * Initialize a new 'Player' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Player = function(opts) {
    Character.call(this, opts);
    this.id = opts.id;
    this.type = EntityType.PLAYER;
    this.userId = opts.userId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.nickname = opts.nickname;
    this.equipments = opts.equipments;
    this.package = opts.package;
    this.skillPoint = opts.skillPoint || 0;
    this.skills = opts.skills;
    this.formation = opts.formation;
    this.partners = opts.partners;
    this.gift = opts.gift;

    var heros = dataApi.heros.data;
    this.nextLevelExp = formula.calculateAccumulated_xp(heros[this.cId]["xpNeeded"], heros[this.cId]["levelFillRate"], this.level + 1);//hero.xpNeeded, hero.levelFillRate, level
    this.herosData = dataApi.heros.findById(this.kindId);
    this.curTasks = opts.curTasks;
    this.range = opts.range || 2;

    this.currentScene = opts.currentScene;
    this.currentIndu = opts.currentIndu;

    this.serverId = opts.serverId;
    this.sid = opts.serverId;
    this.regionId = opts.serverId;

    this.money = opts.money;
    this.gameCurrency = opts.gameCurrency;

    this.curTasksEntity = opts.curTasksEntity;
    this.equipmentsEntity = opts.equipmentsEntity;
    this.packageEntity = opts.packageEntity;
};

util.inherits(Player, Character);

/**
 * Expose 'Player' constructor.
 */
module.exports = Player;

//Add experience
Player.prototype.addExperience = function(exp) {
    this.experience += parseInt(exp);
    if (this.experience >= this.nextLevelExp) {
        this.upgrade();
    }
    this.save();
};

//Add experience
Player.prototype.addExp = function(exp) {
    this.experience += parseInt(exp);
    if (this.experience >= this.nextLevelExp) {
        this.upgrade();
    }
};

/**
 * 更新血量
 * @param hp
 */
Player.prototype.updateHP = function(cb) {
    userDao.updatePlayer(this, "hp", cb);
}

/**
 * Upgrade and update the player's state
 * when it upgrades, the state such as hp, mp, defense etc will be update
 * emit the event 'upgrade'
 *
 * @api public
 */
Player.prototype.upgrade = function() {
    var upgradeColumn = {};
    while (this.experience >= this.nextLevelExp) {
        upgradeColumn = this._upgrade();
    }
    var that = this;
    logger.info(upgradeColumn);
    userDao.upgrade(this, upgradeColumn, function(err, reply) {
        that.updateAttribute();
        that.emit('upgrade');//pushMessage
    });
};

//Upgrade, update player's state
Player.prototype._upgrade = function() {
    this.level += 1;
    var level = this.level;
    var hero = dataApi.heros.findById(this.cId);
    var upgradeColumn = {
        level: level,
        needExp: formula.calculateXpNeeded(hero.xpNeeded, hero.levelFillRate, level + 1),
        accumulated_xp: formula.calculateAccumulated_xp(hero.xpNeeded, hero.levelFillRate, level),
        hp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
        maxHp: formula.calculateHp(parseInt(hero.hp), parseInt(hero.hpFillRate), level),
        attack: formula.calculateAttack(parseInt(hero.attack), parseInt(hero.attLevelUpRate), level),
        defense: formula.calculateDefense(parseInt(hero.defense), parseInt(hero.defLevelUpRate), level),
        focus: formula.calculateFocus(parseInt(hero.focus), parseInt(hero.focusMaxIncrement), level),
        speedLevel: formula.calculateSpeedLevel(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
        speed: formula.calculateSpeed(parseInt(hero.speedLevel), parseInt(hero.speedMaxIncrement), level),
        dodge: formula.calculateDodge(parseInt(hero.dodge), parseInt(hero.dodgeMaxIncrement), level),
        criticalHit: formula.calculateCriticalHit(parseInt(hero.criticalHit), parseInt(hero.critHitMaxIncrement), level),
        critDamage: formula.calculateCritDamage(parseInt(hero.critDamage), parseInt(hero.critDamageMaxIncrement), level),
        block: formula.calculateBlock(parseInt(hero.block), parseInt(hero.blockMaxIncrement), level),
        counter: formula.calculateCounter(parseInt(hero.counter), parseInt(hero.counterMaxIncrement), level)
    }
    this.setNextLevelExp();
    return upgradeColumn;
};

Player.prototype.setNextLevelExp = function() {
    var hero = dataApi.heros.findById(this.cId);
    this.nextLevelExp = formula.calculateAccumulated_xp(hero["xpNeeded"], hero["levelFillRate"], this.level + 1);//hero.xpNeeded, hero.levelFillRate, level
}

Player.prototype.updateAttribute = function() {
    var attack = 0;
    var defense = 0;
    var speedLevel = 0;
    var hp = 0;
    var focus = 0;
    var criticalHit = 0;
    var critDamage = 0;
    var dodge = 0;
    var block = 0;
    var counter = 0;
    var counterDamage = 0;
    var equipments;
    var equipment;
    //集中值 武器百分比 技能百分比 buff百分比
    //武器攻击力 技能攻击力 道具攻击力 buff攻击力
    attack = this.attack + this.attack * this.focus;
    defense = this.defense;
    speedLevel = this.speedLevel;
    hp = this.hp;
    focus = this.focus;
    criticalHit = this.criticalHit;
    critDamage = this.critDamage;
    dodge = this.dodge;
    block = this.block;
    counter = this.counter;

    equipments = this.equipmentsEntity.getInfo();

    // 百分比加成和数值加成
    for(var key in equipments) {
        if(equipments[key].epid != 0) {
            equipment = dataApi.equipmentLevelup.findById(equipments[key].epid + equipments[key].level);
            if(equipment.attackPercentage != 0)
                attack += this.attack * equipment.attackPercentage;
            if(equipment.defensePercentage != 0)
                defense += this.defense * equipment.defensePercentage;
            if(equipment.speedLevelPercentage != 0)
                speedLevel += this.speedLevel * equipment.speedLevelPercentage;
            if(equipment.hpPercentage != 0)
                hp += this.hp * equipment.hpPercentage;

            attack += equipment.attack;
            defense += equipment.defense;
            speedLevel += equipment.speedLevel;
            hp += equipment.hp;
            focus += equipment.focus;
            criticalHit += equipment.criticalHit;
            critDamage += equipment.critDamage;
            dodge += equipment.dodge;
            block += equipment.block;
            counter += equipment.counter;
        }
    }
    this.attack = Math.floor(attack);
    this.defense = Math.floor(defense);
    this.speedLevel = Math.floor(speedLevel);
    this.hp = hp;
    this.maxHp = hp;
    this.focus = focus;
    this.criticalHit = criticalHit;
    this.critDamage = critDamage;
    this.dodge = dodge;
    this.block = block;
    this.counter = counter;
};

/**
 * Equip equipment.
 *
 * @param {String} type
 * @param {Number} equipId
 * @api public
 */
Player.prototype.equip = function(type, item, pIndex) {
    var index = 0;
    var epType = "";
    if(type == "weapons") {
        epType = "weapon";
    }
    var curEquipment = this.equipmentsEntity.get(epType);
    logger.info(curEquipment);
    this.equipmentsEntity.equip(epType, {
        epid: item.itemId,
        level: item.level
    });

    if (curEquipment.epid != 0) {
        index = this.packageEntity.addItem(type, {
            itemId: curEquipment.epid,
            itemNum: 1,
            level: curEquipment.level
        }, pIndex);
    } else {
        this.packageEntity.removeItem(type, pIndex);
    }
    this.updateAttribute();

    return index;
};

Player.prototype.buyItem = function(type, item, costMoney) {
   //this.money = this.money - costMoney;
   // var packageIndex = this.packageEntity.addItem(type, item);
    var packageChange =   this.packageEntity.addItem(type, item);

  //this.save();    没有判断格式是否够用,还没确定物品是否改变
    /*
    return {
        money: this.money,
        packageIndex: packageIndex
    } */
    if(packageChange.length != 0){
        this.money = this.money - costMoney;
        this.save();
    }
    return {
        money:this.money,
        packageChange:packageChange
    }
}

/**
 * Unequip equipment by type.
 *
 * @param {Number} type
 * @api public
 */
Player.prototype.unEquip = function(type) {
    this.equipmentsEntity.unEquip(type);
    this.updateAttribute();
};

/**
 * Use Item
 *
 * @param {Number} index
 * @return {Boolean}
 * @api public
 */
Player.prototype.useItem = function(type, index) {
    var item = this.packageEntity.get(type, index);
    if (!item || !item.itemId.match(/D/)) {
        return false;
    }
    this.packageEntity.removeItem(type, index);
    return true;
};

/**
 * Learn a new skill.
 *
 * @param {Number} skillId
 * @param {Function} callback
 * @return {Blooean}
 * @api public
 */
Player.prototype.learnSkill = function(skillId, callback) {
    var skillData = dataApi.fightskill.findById(skillId);
    if (this.level < skillData.playerLevel || !!this.fightSkills[skillId]) {
        return false;
    }
    var fightSkill = fightskill.create({skillId: skillId, level: 1, playerId: this.id, type:'attack'});
    this.fightSkills[skillId] = fightSkill;
    fightskillDao.add(fightSkill, callback);
    return true;
};

/**
 * Upgrade the existing skill.
 *
 * @param {Number} skillId
 * @return {Boolean}
 * @api public
 */
Player.prototype.upgradeSkill = function(skillId) {
    var fightSkill = this.fightSkills[skillId];

    if (!fightSkill || this.skillPoint <= 0 || this.level < fightSkill.skillData.playerLevel * 1 + fightSkill.level * 5) {
        return false;
    }
    fightSkill.level += 1;
    this.skillPoint--;
    fightskillDao.update(fightSkill);
    return true;
};

// Emit the event 'save'.
Player.prototype.save = function() {
    this.emit('save');
};

Player.prototype.updatePlayer = function(field, cb) {
    userDao.updatePlayer(this, field, cb);
}

Player.prototype.updatePlayerAttribute = function(players, cb) {
    playerDao.updatePlayersAttribute(this, players, ["experience"], cb);
}

/**
 * Start task.
 * Start task after accept a task, and update the task' state, such as taskState, taskData, startTime
 *
 * @param {Task} task, new task to be implement
 * @api public
 */
Player.prototype.startTask = function(type, task) {
    task.status = TaskStatus.START_TASK;
    task.taskRecord = {
        itemNum: 0
    };
    task.startTime = formula.timestamp(new Date());
    task.save();
    this.curTasksEntity[type] = task;
};

Player.prototype.getNextTask = function(type, task) {
    var nextTaskId = task.nextTaskId;
    if(type == consts.curTaskType.CURRENT_DAY_TASK) {
        if(this.curTasks[type].length > 1) {
            this.curTasks[type].shift();
            nextTaskId = this.curTasks[type][0].taskId;
        }
    }
    if(nextTaskId == null || nextTaskId == 0) {
        return false;
    }
    var date = new Date();
    var task = {
        "taskId": nextTaskId,
        "status": 0,
        "taskRecord": {"itemNum": 0},
        "startTime": date.getTime()
    };
    var characterId = utils.getRealCharacterId(this.id);
    task = taskDao.createNewTask(task, this.sid, this.registerType, this.loginName, characterId);
    this.curTasksEntity[type] = task;
    return true;
}

Player.prototype.updateTask = function() {
    userDao.updatePlayer(this, "curTasksEntity");
}

Player.prototype.updateTaskRecord = function(taskType, items) {
    var task = {};
    for(var type in this.curTasksEntity.strip()) {
        task = this.curTasksEntity[type];
        if(task.taskGoal.type == taskType) {
            task.updateRecord(this, taskType, items);
        }
    }
}

/**
 * Handover task.
 * Handover task after curTask is completed, and upgrade the tasks' state
 *
 * @param {Array} taskIds
 * @api public
 */
Player.prototype.handOverTask = function(taskIds) {
    var length = taskIds.length;
    var type = "";
    var date = new Date();
    var nextTasks = {};
    for (var i = 0; i < length; i++) {
        var type = taskIds[i];
        var task = this.curTasksEntity[type];
        task.status = TaskStatus.HANDOVERED;
        task.handOverTime = date.getTime();
        task.save();
        this.logTaskData(type);
        if(this.getNextTask(type, task)) {
            nextTasks[type] = task.getInfo();
        }
    }
    return nextTasks;
};

/**
 * Recover hp if not in fight state
 *
 */
Player.prototype.recover = function(lastTick){
    var time = Date.now();
};

//Complete task and tasks' state.
Player.prototype.completeTask = function(type) {
    var task = this.curTasksEntity[type];
    var date = new Date();
    task.status = TaskStatus.COMPLETED;
    task.finishTime = date.getTime();
    task.save();
};

Player.prototype.taskProgress = function(type) {
    var task = this.curTasksEntity[type];
    this.emit('taskProgress', task.taskInfo());//pushMessage
};

Player.prototype.logTaskData = function(type) {
    var task = this.curTasksEntity[type];
    taskDao.savePlayerTaskData(this, task.logTask());
}

//Convert player' state to json and return
Player.prototype.strip = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        x: Math.floor(this.x),
        y: Math.floor(this.y),
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        currentScene: this.currentScene,
        currentIndu: this.currentIndu,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        curTasks: this.curTasksEntity.getInfo(),
        equipments: this.equipmentsEntity.getInfo(),
        package: this.packageEntity.getInfo(),
        skills: this.skills,
        formation: this.formation,
        partners: this.getPartners(),
        gift: this.gift
    };
};

Player.prototype.updateColumn = function() {
    return {
        id: this.id,
        serverId: this.sid,
        registerType: this.registerType,
        loginName: this.loginName,
        columns : {
            experience: this.experience,
            money: this.money,
            hp: this.hp
        }
    };
};

Player.prototype.addMoney = function(money) {
    this.money += parseInt(money);
}

/**
 * Get the whole information of player, contains tasks, package, equipments information.
 *
 *	@return {Object}
 *	@api public
 */
Player.prototype.getInfo = function() {
    var playerData = this.strip();
    return playerData;
};

/**
 * getPartners
 */
Player.prototype.getPartners = function() {
    var array = [];
    for(var i = 0 ; i < this.partners.length ; i++) {
        array.push(this.partners[i].strip());
    }
    return array;
}

/**
 * getPartner
 */
Player.prototype.getPartner = function(playerId) {
    var partner = null;
    for(var i = 0, l = this.partners.length ; i < l ; i++) {
        if(this.partners[i].id == playerId) {
            partner = this.partners[i];
            break;
        }
    }
    return partner;
}

Player.prototype.setEquipmentsEntity = function(equipmentsEntity){
    this.equipmentsEntity = equipmentsEntity;
    this.updateAttribute();
}

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Player.prototype.toJSON = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        nickname: this.nickname,
        cId: this.cId,
        type: this.type,
        x: Math.floor(this.x),
        y: Math.floor(this.y),
        hp: this.hp,
        maxHp: this.maxHp,
        anger: this.anger,
        level: this.level,
        experience: this.experience,
        attack: this.attack,
        defense: this.defense,
        speedLevel: this.speedLevel,
        speed: this.speed,
        currentScene: this.currentScene,
        currentIndu: this.currentIndu,
        focus: this.focus,
        dodge: this.dodge,
        nextLevelExp: this.nextLevelExp,
        money: this.money,
        gameCurrency: this.gameCurrency,
        photo: this.photo,
        criticalHit: this.criticalHit,
        critDamage: this.critDamage,
        block: this.block,//格挡
        counter: this.counter,//反击
        curTasks: this.curTasksEntity.getInfo(),
        equipments: this.equipmentsEntity.getInfo(),
        package: this.packageEntity.getInfo(),
        skills: this.skills,
        formation: this.formation,
        partners: this.getPartners(),
        gift: this.gift
    };
};
