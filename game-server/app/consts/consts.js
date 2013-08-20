/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: consts
 */
module.exports = {
    AttackResult: {
        SUCCESS: 1,
        KILLED: 2,
        MISS: 3,
        NOT_IN_RANGE: 4,
        NO_ENOUGH_MP: 5,
        NOT_COOLDOWN: 6,
        ATTACKER_CONFUSED: 7,
        ERROR: -1
    },

    RES_CODE: {
        SUC_OK: 1,                      // success
        ERR_FAIL: -1,                   // Failed without specific reason
        ERR_USER_NOT_LOGINED: -2,     // User not login
        ERR_CHANNEL_DESTROYED: -10,   // channel has been destroyed
        ERR_SESSION_NOT_EXIST: -11,   // session not exist
        ERR_CHANNEL_DUPLICATE: -12,   // channel duplicated
        ERR_CHANNEL_NOT_EXIST: -13    // channel not exist
    },

    MYSQL: {
        ERROR_DUP_ENTRY: 1062
    },

    PLAYER: {
        initAreaId: 1,
        level: 1,
        reviveTime: 5000,
        RECOVER_WAIT: 10000,    // You must wait for at least 10s to start recover hp
        RECOVER_TIME: 10000     // You need 10s to recover hp from 0 to full
    },

    BornPlace: {
        x: 346,
        y: 81,
        width: 126,
        height: 129
    },

    MESSAGE: {
        RES: 200,
        ARGUMENT_EXCEPTION: 101,
        ERR: 500,
        PUSH: 600
    },

    EntityType: {
        PLAYER: 'player',
        PARTNER: 'partner',
        OPPONENT: 'opponent',
        OPPONENT_PARTNER: 'opponent_partner',
        MONSTER: 'monster',
        NPC: 'npc',
        EQUIPMENT: 'equipment',
        ITEM: 'item',
        PACKAGE: 'package',
        SERVERLIST: 'serverList'
    },

    Pick: {
        SUCCESS: 1,
        VANISH: 2,
        NOT_IN_RANGE: 3,
        BAG_FULL: 4
    },

    NPC: {
        SUCCESS: 1,
        NOT_IN_RANGE: 2
    },

    TaskStatus: {
        HANDOVERED: 5,
        COMPLETED: 4,
        CANNOT_ACCEPT: 3,
        NOT_COMPLETED: 2,
        START_TASK: 1,
        NOT_START: 0
    },

    /**
     * currentMainTask
     * currentBranchTask
     * currentDayTask
     * currentExerciseTask
     */
    curTaskType: {
        CURRENT_MAIN_TASK: "currentMainTask",
        CURRENT_BRANCH_TASK: "currentBranchTask",
        CURRENT_DAY_TASK: "currentDayTask",
        CURRENT_EXERCISE_TASK: "currentExerciseTask"
    },

    correspondingCurTaskType: {
        1: "currentMainTask",
        2: "currentBranchTask",
        3: "currentDayTask",
        4: "currentExerciseTask"
    },

    /**
     * 任务目标类型
     * 0 - 接取即完成
     * 1 - 击杀怪物数量
     * 2 - 获得道具
     * 3 - 通关副本
     * 4 - PVP战斗
     * 5 - 给人物装备指定/任意装备
     * 6 - 英雄升到指定等级
     * 7 - 升级指定/任意装备
     * 8 - 购买指定/任意道具
     * 9 - 消费指定/任意数目元宝
     * 10 - 学会指定技能
     * 11 - 调整阵型
     */
    TaskGoalType: {
        DIALOG: 0,
        KILL_MONSTER: 1,
        GET_ITEM: 2,
        PASS_INDU: 3,
        PVP: 4,
        EQUIPMENT: 5,
        TO_LEVEL: 6,
        UPGRADE_EQUIPMENT: 7,
        BUY_ITEM: 8,
        CONSUMER_GAMECURRENCY: 9,
        LEARN_SKILL: 10,
        CHANGE_FORMATION: 11
    },

    NpcType: {
        TALK_NPC: '0',
        TRAVERSE_NPC: '1'
    },

    PackageType: {
        WEAPONS: "weapons",
        EQUIPMENTS: "equipments",
        ITEMS: "items"
    },

    EqType: {
        WEAPON: 'weapon',//武器
        NECKLACE: 'necklace',//项链
        HELMET: 'helmet',//头盔
        ARMOR: 'armor' ,//护甲 衣服
        BELT: 'belt',//腰带
        LEGGUARD: 'legguard',//护腿 裤子
        AMULET: 'amulet',//护符
        SHOES: 'shoes',//鞋
        RING: 'ring'//戒指
    },

    MailType: {
        SYSTEM: 1,
        PLAYER: 2,
        TASK: 3,
        BATTLEFIELD: 4
    },

    MailKeyType:{
        NOREAD:"ERN",
        HASITEM:"ERW",
        READ:"ERR",
        SEND:"ES"
    },

    EventType: {
        GET: 1,
        DESTROY: 2,
        ENTRANCE: 3,
        PORT: 4
    },

    Event: {
        chat: 'onChat'
    },

    /**
     * check a entity that whether can be picked
     * @param entity
     * @returns {*|boolean}
     */
    isPickable: function(entity) {
        return entity && (entity.type === module.exports.EntityType.EQUIPMENT || entity.type === module.exports.EntityType.ITEM);
    }
}