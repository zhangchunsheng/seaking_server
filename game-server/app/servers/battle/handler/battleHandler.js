/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-01
 * Description: battleHandler
 */
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var async = require('async');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var formula = require('../../../consts/formula');
var Player = require('../../../domain/entity/player');
var Monster = require('../../../domain/entity/monster');
var EntityType = require('../../../consts/consts').EntityType;
var Fight = require('../../../domain/battle/fight');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;

    if(!this.app)
        logger.error(app);
};

var pro = Handler.prototype;

pro.battle = pro.fight = function(msg, session, next) {
    var uid = session.uid
        , serverId = session.get("serverId")
        , registerType = session.get("registerType")
        , loginName = session.get("loginName")
        , induId = msg.induId
        , eid = msg.eid;
    logger.info(eid);
    userDao.getCharacterInfo(serverId, registerType, loginName, function(err, character) {
        var owner_formationData = character.formation;//[{"cId":1},{"cId":2},{"cId":3},null,null,null,null]// array index - 阵型位置 array value - character id
        var induMonstergroup = dataApi.induMonstergroup.findById(mgid);
        var monster_formationData = induMonstergroup.formation;//["M10101","M10102",0,"M10103",0,0,0];// 0,1,2,3,4,5,6
        logger.info(owner_formationData);
        logger.info(monster_formationData);
        var owners = {};
        var monsters = {};
        logger.info(session);
        var player;

        // 阵型中角色数据
        // get player info from db
        for(var i = 0 ; i < owner_formationData.length ; i++) {
            if(owner_formationData[i] != null && owner_formationData[i] != 0) {
                if(character.cId == owner_formationData[i].cId) {
                    player = new Player(Fight.createCharacter({
                        id: owner_formationData[i].cId,
                        cId: owner_formationData[i].cId,
                        level: i + 1,
                        formationId: i,
                        type: EntityType.PLAYER
                    }));
                    owners[i] = player;
                } else {

                }
            }
        }
        // get monster info from file config
        for(var i = 0 ; i < monster_formationData.length ; i++) {
            if(monster_formationData[i] != null && monster_formationData[i] != 0) {
                player = new Monster(Fight.createMonster({
                    id: monster_formationData[i],
                    formationId: i,
                    type: EntityType.MONSTER
                }));
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

        next(null, result);
    });
}
