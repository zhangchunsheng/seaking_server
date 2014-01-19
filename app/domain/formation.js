/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-08
 * Description: formation
 */
var util = require('util');
var Persistent = require('./persistent');
var consts = require('../consts/consts');
var dataApi = require('../utils/dataApi');

/**
 * Initialize a new 'Formation' with the given 'opts'.
 * Formation inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Formation = function(opts) {
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.characterId = opts.characterId;
    this.cId = opts.cId;

    this.formation = opts.formation;
    this.lastFormation = opts.lastFormation;

    this.tacticals = opts.tacticals;//阵法列表
};
util.inherits(Formation, Persistent);

/**
 * Expose 'Formation' constructor
 */

module.exports = Formation;

Formation.prototype.initFormation = function() {
    var formation = {formation:{1:{playerId:"S" + this.serverId + "C" + this.characterId}},tactical:{id:"F101",level:1}};
    return formation;
}

Formation.prototype.initTacticals = function() {
    var tacticals = [{"id":"F101","level":1,"active":1}];
    return tacticals;
}

Formation.prototype.checkFormation = function(player, formation) {
    var result = 0;

    var player_formation = this.formation.formation;
    var players = [];
    players.push(player.id);
    for(var i = 0 ; i < player.partners.length ; i++) {
        players.push(player.partners[i].id);
    }
    var playerId = "";
    var players_args = {};//判断playerId唯一
    for(var i in player_formation) {
        if(typeof formation[i] == "undefined") {
            result = 0;
            return result;
        }
        playerId = formation[i];
        if(playerId == null || playerId == "")
            continue;
        if(typeof players_args[formation[i]] == "undefined") {
            players_args[formation[i]] = 1;
        } else {
            players_args[formation[i]]++;
            result = 0;
            return result;
        }
    }
    //判断是否存在playerId
    var flag = false;
    for(var i in player_formation) {
        flag = false;
        playerId = formation[i];
        if(playerId == null || playerId == "")
            continue;
        for(var j = 0 ; j < players.length ; j++) {
            if(playerId == players[j]) {
                flag = true;
                break;
            }
        }
        if(!flag) {
            result = 0;
            return result;
        }
    }
    result = 1;
    return result;
}

/**
 * checkTacticalId
 * @param player
 * @param tacticalId
 * @returns {number}
 */
Formation.prototype.checkTacticalId = function(player, tacticalId) {
    var result = 0;

    var tacticals = this.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticalId == tacticals[i].id) {
            if(tacticals[i].active == 1) {
                result = 2;
            } else {
                result = 1;
            }
            break;
        }
    }
    return result;
}

/**
 *
 * @param player
 * @param tacticalId
 * @returns {number}
 */
Formation.prototype.hasTacticalId = function(player, tacticalId) {
    var result = 0;

    var tacticals = this.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticalId == tacticals[i].id) {
            result = 1;
            break;
        }
    }
    return result;
}

/**
 * checkUnlock
 * @param player
 * @returns {number}
 */
Formation.prototype.checkUnlock = function(player, formationId) {
    var result = 0;

    var formation = this.formation.formation;
    if(typeof formation[formationId] != "undefined") {
        result = -2;
        return result;
    }

    var count = this.getPositionCount(player.level);
    var formation_count = 0;
    for(var i in formation) {
        formation_count++;
    }
    if(formation_count == 7) {
        result = -1;
        return result;
    }
    if(count == formation_count) {
        result = 0;
    } else if(count > formation_count) {
        result = count - formation_count;
    }
    return result;
}

/**
 *
 * 升级所需金钱，每升级一次翻倍
 * 材料1数量每升级一次翻倍
 * 材料2数量始终固定
 * @param player
 * @param level
 * @param upgradeMaterial
 */
Formation.prototype.checkUpgradeTacticalRequired = function(player, level, upgradeMaterial) {
    var required = {};

    var money = 0;
    if(level == 0) {
        money = upgradeMaterial[0][0] * 1;
    } else {
        money = upgradeMaterial[0][0] * (level * 2);
    }
    var materials = [];

    materials.push(upgradeMaterial[0][1]);
    materials.push(upgradeMaterial[0][2]);
    console.log(upgradeMaterial);

    // check materials
    var array = [];
    var itemId = "";
    var itemNum = 0;
    var flag = [];
    var items = [];
    required.packageInfo = [];
    for(var i = 0 ; i < materials.length ; i++) {
        if(materials[i].indexOf("|") > 0) {
            array = materials[i].split("|");
            itemId = array[0];
            itemNum = array[1];
            if(level == 0) {
                itemNum = itemNum * 1;
            } else {
                itemNum = itemNum * (level * 2);
            }
        } else {
            itemId = materials[i];
            itemNum = 1;
        }

        items.push({
            itemId: itemId,
            itemNum: itemNum
        });
    }
    flag = player.packageEntity.checkMaterial(items);
    if(flag.length != items.length) {
        return -1;
    }
    required.packageInfo = flag;

    // check money
    if(money > player.money) {
        return -3;
    }
    required.money = money;
    return required;
}

Formation.prototype.getTacticalLevel = function(tacticalId) {
    var level = 0;
    var tacticals = this.tacticals;
    for(var i = 0 ; i < tacticals.length ; i++) {
        if(tacticals[i].id == tacticalId) {
            level = tacticals[i].level;
        }
    }
    return level;
}

/**
 * getCellCount
 * @param level
 * @returns {number}
 */
Formation.prototype.getPositionCount = function(level) {
    var count = 1;
    if(level >= 10) {
        count++;
        var num = (level - 10) % 5;
        if(num == 0) {
            count += ((level - 10) / 5);
        }
    }
    if(count > 7) {
        count = 7;
    }
    return count;
}

Formation.prototype.strip = function() {
    return {
        formation: this.formation,
        lastFormation: this.lastFormation,
        tacticals: this.tacticals
    }
}

Formation.prototype.getInfo = function() {
    return {
        formation: this.formation,
        lastFormation: this.lastFormation,
        tacticals: this.tacticals
    }
}

/**
 *
 * @returns {{f: {}, t: {}}}
 */
Formation.prototype.getAbbreviation = function() {
    var abbreviation = {
        f: {},
        t: {}
    };
    abbreviation.f.s = this.formation.tactical.id;
    abbreviation.f.f = [];
    var formation = this.formation.formation;
    for(var i = 1 ; i <= 7 ; i++) {
        if(typeof formation[i] != "undefined") {
            if(formation[i] == null) {
                abbreviation.f.f.push('e');
            } else {
                abbreviation.f.f.push(formation[i].playerId);
            }
        } else {
            abbreviation.f.f.push(0);
        }
    }
    var tacticals = this.tacticals;
    var allTacticals = dataApi.formations.all();
    var tacticalId = "";
    var level = 0;
    var flag = false;
    for(var i in allTacticals) {
        flag = false;
        for(var j = 0 ; j < tacticals.length ; j++) {
            tacticalId = tacticals[j].id;
            level = tacticals[j].level;
            if(allTacticals[i].id == tacticals[j].id) {
                flag = true;
                abbreviation.t[tacticalId] = level;
            }
        }
        if(!flag) {
            abbreviation.t[allTacticals[i].id] = 0;
        }
    }
    return abbreviation;
}