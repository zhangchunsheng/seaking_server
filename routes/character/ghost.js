/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-09
 * Description: ghost
 */
var playerService = require('../../app/services/playerService');
var userService = require('../../app/services/userService');
var ghostService = require('../../app/services/character/ghostService');
var packageService = require('../../app/services/packageService');
var equipmentsService = require('../../app/services/equipmentsService');
var taskService = require('../../app/services/taskService');
var redisService = require('../../app/services/redisService');
var Code = require('../../shared/code');
var utils = require('../../app/utils/utils');
var partnerUtil = require('../../app/utils/partnerUtil');
var consts = require('../../app/consts/consts');
var EntityType = require('../../app/consts/consts').EntityType;
var dataApi = require('../../app/utils/dataApi');
var ghosts = require('../../config/data/ghosts');
var area = require('../../app/domain/area/area');
var world = require('../../app/domain/world');
var async = require('async');

exports.index = function(req, res) {

}

exports.upgrade = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var array = [];

        var character;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        } else {
            character = player;
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        var ghost = character.ghost;
        if(utils.empty(ghost)) {
            data = {
                code: Code.CHARACTER.NO_GHOSTDATA
            };
            utils.send(msg, res, data);
            return;
        }

        ghost.level = parseInt(ghost.level) + 1;
        var heroId = utils.getCategoryHeroId(character.cId);

        var ghostData = ghosts[heroId][ghost.level - 1];
        if(utils.empty(ghostData)) {
            data = {
                code: Code.CHARACTER.TOP_LEVEL
            };
            utils.send(msg, res, data);
            return;
        }

        var probability = ghostData.probability;

        if(utils.empty(player.ghostNum) || parseInt(player.ghostNum) < parseInt(ghostData.costGhostNum)) {
            data = {
                code: Code.CHARACTER.NOMORE_GHOSTNUM
            };
            utils.send(msg, res, data);
            return;
        }

        var random = 0;
        var status = 1;
        var level = 0;
        if(probability >= 100) {
            status = 1;
            player.ghostNum = parseInt(player.ghostNum) - parseInt(ghostData.costGhostNum);
            character.ghostEntity.set(ghost);
            var attrValue = character.ghostEntity.getValue();

            if(probability > 100) {
                var num = probability - 100;
                random = utils.random(1, 100);
                if(random >= 1 && random <= num) {
                    level = ghost.level;
                    level++;
                    ghostData = ghosts[heroId][level - 1];
                    if(utils.empty(ghostData)) {
                        //top level
                    } else {
                        ghost.level++;
                    }
                }
            }
        } else {
            random = utils.random(1, 100);
            if(random >= 1 && random <= probability) {
                status = 1;
                player.ghostNum = parseInt(player.ghostNum) - parseInt(ghostData.costGhostNum);
                character.ghostEntity.set(ghost);
                var attrValue = character.ghostEntity.getValue();
            } else {
                status = 0;
            }
        }

        if(status == 1) {
            ghostService.upgrade(array, player, character, function(err, reply) {
                data = {
                    code: Code.OK,
                    level: reply,
                    ghostNum: player.ghostNum
                };
                //data.attrValue = attrValue;
                utils.send(msg, res, data);
            });
        } else {
            data = {
                code: Code.CHARACTER.NOT_LUCKEY
            };
            utils.send(msg, res, data);
        }
    });
}