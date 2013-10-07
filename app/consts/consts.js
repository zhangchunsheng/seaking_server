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

    ItemType: {
        canUser: "10",
        canNotUser: "11"
    },

    ItemCategory: {
        Increase: "01",
        HPreply: "02",
        UpgradeMaterial: "03",
        DesignDrawings: "04",
        TreasureChest: "05",
        Keys: "06",
        NoAttributeItem: "07",
        TaskItem: "08",
        Activity: "09"
    },

    skillType: {
        ACTIVE_SKILL: 1,
        PASSIVE_SKILL: 2
    },

    skillsType: {
        CURRENT_SKILL: "currentSkill",
        ACTIVE_SKILLS: "activeSkills",
        PASSIVE_SKILLS: "passiveSkills"
    },

    attrNames: {
        ATTACK: "attack",
        DEFENSE: "defense",
        SPEEDLEVEL: "speedLevel",
        HP: "hp",
        MAXHP: "maxHp",
        FOCUS: "focus",
        CRITICALHIT: "criticalHit",
        CRITICALHIT: "critDamage",
        DODGE: "dodge",
        BLOCK: "block",
        COUNTER: "counter"
    },

    correspondingSkillsType: {
        1: "activeSkills",
        2: "passiveSkills"
    },

    effect_attr: {
        HP: "1",//HP
        EXPERIENCE: "2",//经验
        ATTACK: "3",//攻击
        DEFENSE: "4",//防御
        FOCUS: "5",//集中值
        SPEED: "6",//速度
        DODGE: "7",//闪避
        CRITICALHIT: "8",//暴击几率
        CRITDAMAGE: "9",//暴击伤害
        BLOCK: "10",//格挡
        COUNTER: "11",//反击
        PARALLELDAMAGE: "12",//溅射伤害
        BURN: "13",//点燃
        STUNT: "14",//禁锢
        POISON: "15",//施毒
        CONFUSION: "16",//迷惑
        DEFENSE_FOCUS: "17",//防御力加成(focus)
        HPRECOVERYSPEED: "18",//血量回复
        ADDITEMATTR: "19",//装备加成
        ADDATTACK: "20",//增加自己攻击力
        BOUNCEATTACK: "21",//反弹伤害
        MONEY: "22",//额外金钱
        ADDBLOOD: "23",//吸血
        ATTACK_FOCUS: "24",//攻击力加成(focus)
        SKILL: "25",//技能
        ICE: "26"//冰冻
    },

    EffectType: {
        "hp": 1,
        "experience": 2,
        "attack": 3,
        "defense": 4,
        "focus": 5,
        "speed": 6,
        "dodge": 7,
        "criticalHit": 8,
        "critDamage": 9,
        "block": 10,
        "counter": 11,
        "parallelDamage": 12,
        "burn": 13,
        "stunt": 14,
        "poison": 15,
        "confusion": 16,
        "defense_focus": 17,
        "hpRecoverySpeed": 18,
        "addItemAttr": 19,
        "addAttack": 20,
        "bounceAttack": 21,
        "money": 22,
        "addBlood": 23,
        "attack_focus": 24,
        "skill": 25,
        "ice": 26,
        "block_focus": 30,
        "counter_focus": 31,
        "criticalHit_focus": 32
    },

    buffKind: {
        ITEM: 1,
        SKILL: 2
    },

    buffType: {
        HP: "hp",//HP
        EXPERIENCE: "experience",//经验
        ATTACK: "attack",//攻击
        DEFENSE: "defense",//防御
        FOCUS: "focus",//集中值
        SPEED: "speed",//速度
        DODGE: "dodge",//闪避
        CRITICALHIT: "criticalHit",//暴击几率
        CRITDAMAGE: "critDamage",//暴击伤害
        BLOCK: "block",//格挡
        COUNTER: "counter",//反击
        PARALLELDAMAGE: "parallelDamage",//溅射伤害
        BURN: "burn",//点燃
        STUNT: "stunt",//禁锢
        POISON: "poison",//施毒
        CONFUSION: "confusion",//迷惑
        DEFENSE_FOCUS: "defense_focus",//防御力加成(focus)
        HPRECOVERYSPEED: "hpRecoverySpeed",//血量回复
        ADDITEMATTR: "addItemAttr",//装备加成
        ADDATTACK: "addAttack",//增加自己攻击力
        BOUNCEATTACK: "bounceAttack",//反弹伤害
        MONEY: "money",//额外金钱
        ADDBLOOD: "addBlood",//吸血
        ATTACK_FOCUS: "attack_focus",//攻击力加成(focus)
        SKILL: "skill",//技能
        ICE: "ice",//冰冻
        BLOCK_FOCUS: "block_focus",//格挡focus加成
        COUNTER_FOCUS: "counter_focus",//反击focus加成
        CRITICALHIT_FOCUS: "criticalHit_focus"//暴击几率focus加成
    },

    correspondingEffect_attr: {
        1: "hp",
        2: "experience",
        3: "attack",
        4: "defense",
        5: "focus",
        6: "speed",
        7: "dodge",
        8: "criticalHit",
        9: "critDamage",
        10: "block",
        11: "counter",
        12: "parallelDamage",
        13: "burn",
        14: "stunt",
        15: "poison",
        16: "confusion",
        17: "defense_focus",
        18: "hpRecoverySpeed",
        19: "addItemAttr",
        20: "addAttack",
        21: "bounceAttack",
        22: "money",
        23: "addBlood",
        24: "attack_focus",
        25: "skill",
        26: "ice",
        30: "block_focus",
        31: "counter_focus",
        32: "criticalHit_focus"
    },

    valueType: {
        NUMBER: 1,//"数值"
        PERCENTAGE: 2,//"百分比"
        GETPERCENTAGE: 3//获取目标值(百分比）
    },

    timeType: {
        ATTACK_NUM: 0,//攻击次数
        BEHITTED_NUM: 1,//受攻击次数
        ROUND: 2,//回合
        PERMANENTLY: 3//永久
    },

    targetType: {
        OWNER_SINGLE: 1,//己方单体
        OPPONENT_SINGLE: 2,//敌方单体
        OWNER_ALL: 3,//己方全体
        OPPONENT_ALL: 4,//敌方全体
        OWNER_RANDOM: 5,//己方随机目标
        OPPONENT_RANDOM: 6,//敌方随机目标
        OWNER_SPECIFIC: 7,//己方特定目标
        OPPONENT_SPECIFIC: 8//敌方特定目标
    },

    requirementType: {
        COINS: "coins",
        LEVEL: "level",
        SKILLS: "skills",
        ITEMS: "items"
    },

    skill_speedType: {
        EA: "ea",
        EHR: "ehr",
        ESHR: "eshr"
    },

    skilllevel_header_effect: {
        default: {
            1: {
                name: "valueType",
                showName: "属性值类型",
                type: "enum",
                enum: "valueType"
            },
            2: {
                name: "value",
                showName: "属性值",
                type: "int"
            },
            3: {
                name: "targetType",
                showName: "作用目标类型",
                type: "enum",
                enum: "targetType"
            },
            4: {
                name: "targetValue",
                showName: "作用目标值",
                type: "int"
            },
            5: {
                name: "timeType",
                showName: "时间类型",
                type: "enum",
                enum: "timeType"
            },
            6: {
                name: "timeValue",
                showName: "时间值",
                type: "int"
            }
        },
        parallelDamage: {
            1: {
                name: "value",
                showName: "溅射伤害",
                type: "int"
            },
            2: "",
            3: "",
            4: "",
            5: "",
            6: ""
        },
        burn: {
            1: {
                name: "value",
                showName: "点燃伤害",
                type: "int"
            },
            2: {
                name: "timeValue",
                showName: "持续几轮",
                type: "int"
            },
            3: "",
            4: "",
            5: "",
            6: ""
        },
        stunt: {
            1: {
                name: "value",
                showName: "禁锢次数",
                type: "int"
            },
            2: "",
            3: "",
            4: "",
            5: "",
            6: ""
        },
        poison: {
            1: {
                name: "value",
                showName: "施毒伤害",
                type: "int"
            },
            2: {
                name: "timeValue",
                showName: "持续几轮",
                type: "int"
            },
            3: "",
            4: "",
            5: "",
            6: ""
        },
        confusion: {
            1: {
                name: "value",
                showName: "持续次数",
                type: "int"
            },
            2: "",
            3: "",
            4: "",
            5: "",
            6: ""
        },
        ice: {
            1: {
                name: "speedValue",
                showName: "减速值",
                type: "int"
            },
            2: {
                name: "timeValue",
                showName: "持续几轮",
                type: "int"
            },
            3: {
                name: "value",
                showName: "冰冻伤害",
                type: "int"
            },
            4: "",
            5: "",
            6: ""
        },
        skill: {
            1: {
                name: "skillId",
                showName: "技能Id",
                type: "string"
            },
            2: {
                name: "valueType",
                showName: "加成类型",
                type: "enum",
                enum: "valueType"
            },
            3: {
                name: "value",
                showName: "加成数值",
                type: "int"
            },
            4: "",
            5: "",
            6: ""
        }
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