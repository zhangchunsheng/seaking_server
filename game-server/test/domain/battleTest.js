/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-02
 * Description: battleTest
 */
var should = require('should');
var Fight = require('../../app/domain/battle/fight');
var EntityType = require('../../app/consts/consts').EntityType;
var dataApi = require('../../app/util/dataApi');

describe('battle handler test', function() {
    it('should successully', function() {
        var owner_formationData = [1,2,3,0,0,0,0];// array index - 阵型位置 array value - character id
        var monster_formationData = ["M10101","M10102",0,"M10103",0,0,0];// 0,1,2,3,4,5,6
        var owners = {};
        var monsters = {};
        var player;

        // 阵型中角色数据
        // get player info from db
        for(var i = 0 ; i < owner_formationData.length ; i++) {
            if(owner_formationData[i] != null && owner_formationData[i] != 0) {
                player = Fight.createTestCharacter({
                    id: owner_formationData[i],
                    level: (i + 1) * 10,
                    formationId: i,
                    type: EntityType.PLAYER
                });
                owners[i] = player;
            }
        }

        // get monster info from file config
        for(var i = 0 ; i < monster_formationData.length ; i++) {
            if(monster_formationData[i] != null && monster_formationData[i] != 0) {
                player = Fight.createTestMonster({
                    id: monster_formationData[i],
                    level: i + 1,
                    formationId: i,
                    type: EntityType.MONSTER
                });
                monsters[i] = player;
            }
        }

        var fight = new Fight({
            owner_formation: owner_formationData,
            monster_formation: monster_formationData,
            owners: owners,
            monsters: monsters
        });

        var result = fight.fight();

        result.should.equal(result);
    });
});