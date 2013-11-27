/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-14
 * Description: testBattle
 */
var should = require('should');
var battleService = require('../../app/services/battleService');
var userService = require('../../app/services/userService');
var playerService = require('../../app/services/playerService');
var packageService = require('../../app/services/packageService');
var equipmentsService = require('../../app/services/equipmentsService');
var taskService = require('../../app/services/taskService');
var Code = require('../../shared/code');
var utils = require('../../app/utils/utils');
var consts = require('../../app/consts/consts');
var EntityType = require('../../app/consts/consts').EntityType;
var Player = require('../../app/domain/entity/player');
var Opponent = require('../../app/domain/entity/opponent');
var Monster = require('../../app/domain/entity/monster');
var dataApi = require('../../app/utils/dataApi');
var Fight = require('../../app/domain/battle/fight');
var FightV2 = require('../../app/domain/battle/fightV2');
var FightTeam = require('../../app/domain/battle/fightTeam');
var async = require('async');

describe('battle test', function() {
    it('should successully', function() {
        var owner_heros = [{
            heroId: '1',
            level: '1',
            formationId: 1,
            skillId1: 9,
            skillId2: 0,
            skillId3: 0
        }];
        var opponent_heros = [{
            heroId: '1',
            level: '1',
            formationId: 1,
            skillId1: 0,
            skillId2: 0,
            skillId3: 0
        }];

        var data = {};

        var owner_formationData = [null,null,null,null,null,null,null];
        var monster_formationData = [null,null,null,null,null,null,null];

        for(var i = 0 ; i < owner_heros.length ; i++) {
            owner_formationData[owner_heros[i].formationId - 1] = {};
            owner_formationData[owner_heros[i].formationId - 1].heroId = owner_heros[i].heroId;
            owner_formationData[owner_heros[i].formationId - 1].level = owner_heros[i].level;
            owner_formationData[owner_heros[i].formationId - 1].skills = [];
            if(owner_heros[i].skillId1 != 0) {
                owner_formationData[owner_heros[i].formationId - 1].skills.push(owner_heros[i].skillId1);
            }
            if(owner_heros[i].skillId2 != 0) {
                owner_formationData[owner_heros[i].formationId - 1].skills.push(owner_heros[i].skillId2);
            }
            if(owner_heros[i].skillId3 != 0) {
                owner_formationData[owner_heros[i].formationId - 1].skills.push(owner_heros[i].skillId3);
            }
        }

        for(var i = 0 ; i < opponent_heros.length ; i++) {
            monster_formationData[opponent_heros[i].formationId - 1] = {};
            monster_formationData[opponent_heros[i].formationId - 1].heroId = opponent_heros[i].heroId;
            monster_formationData[opponent_heros[i].formationId - 1].level = opponent_heros[i].level;
            monster_formationData[opponent_heros[i].formationId - 1].skills = [];
            if(opponent_heros[i].skillId1 != 0) {
                monster_formationData[opponent_heros[i].formationId - 1].skills.push(opponent_heros[i].skillId1);
            }
            if(opponent_heros[i].skillId2 != 0) {
                monster_formationData[opponent_heros[i].formationId - 1].skills.push(opponent_heros[i].skillId2);
            }
            if(opponent_heros[i].skillId3 != 0) {
                monster_formationData[opponent_heros[i].formationId - 1].skills.push(opponent_heros[i].skillId3);
            }
        }

        var owners = {};
        var monsters = {};
        var player;

        var players = [];
        var enemies = [];
        var playersInfo = [];
        var enemiesInfo = [];

        var ownerTeam = new FightTeam({
            type: consts.teamType.PLAYER_TEAM
        });
        var monsterTeam = new FightTeam({
            type: consts.teamType.MONSTER_TEAM
        });

        var character = null;

        // 阵型中角色数据
        // get player info from db
        for(var i = 0 ; i < owner_formationData.length ; i++) {
            if(owner_formationData[i] != null && owner_formationData[i] != 0) {
                player = new Player(FightV2.createTestPlayer({
                    id: owner_formationData[i].heroId,
                    level: owner_formationData[i].level,
                    formationId: i,
                    type: EntityType.PLAYER,
                    skills: owner_formationData[i].skills
                }));
                player.formationId = i;
                owners[i] = player;

                ownerTeam.addMember(player);
                players.push({
                    "id" : player.id,
                    "maxHP" : player.maxHp,
                    "HP" : player.hp,
                    "anger" : player.anger,
                    "formation" : i
                });
                playersInfo.push(player.getBaseInfo());
                if(character == null) {
                    character = player;
                }
            }
        }
        // get monster info from file config
        var monster = {};
        for(var i = 0 ; i < monster_formationData.length ; i++) {
            if(monster_formationData[i] != null && monster_formationData[i] != 0) {
                player = new Opponent(FightV2.createTestPlayer({
                    id: monster_formationData[i].heroId,
                    level: monster_formationData[i].level,
                    formationId: i,
                    type: EntityType.OPPONENT,
                    skills: monster_formationData[i].skills
                }));
                monsters[i] = player;

                monsterTeam.addMember(player);

                enemies.push({
                    "id" : player.id,
                    "maxHP" : player.maxHp,
                    "HP" : player.hp,
                    "anger" : player.anger,
                    "formation" : i
                });
                enemiesInfo.push(player.getBaseInfo());
            }
        }

        var fight = new FightV2({
            mainPlayer: character,
            owner_formation: owner_formationData,
            monster_formation: monster_formationData,
            owners: owners,
            monsters: monsters,
            ownerTeam: ownerTeam,
            monsterTeam: monsterTeam
        });

        fight.fight(function(err, eventResult) {
            //console.log(eventResult);
            //getTarget(eventResult);
        });
    });
});

function getTarget(eventResult) {
    for(var i = 0 ; i < eventResult.battleData.length ; i++) {
        console.log(eventResult.battleData[i].target);
    }
}