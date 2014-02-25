/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-11-22
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

    pushMessageType: {
        UPGRADE: 1,
        FORMATION_UNLOCK: 2
    },

    publishMessageType: {
        ARENA_PK: 1,
        TIP_MESSAGE: 2
    },

    messageChannel: {
        PUSH_MESSAGE: "pushMessage"
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
        FORGEUPGRADE_EQUIPMENT: 12,
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
        ITEMS: "items",
        DIAMOND: "diamond"
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

    EqDict: [
        'weapon',//武器
        'necklace',//项链
        'helmet',//头盔
        'armor' ,//护甲
        'belt',//腰带
        'legguard',//护腿
        'amulet',//护符
        'shoes',//鞋
        'ring'//戒指
    ],

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
        SEND:"ESS"
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

    skillV2Type: {
        TRIGGER_SKILL: 1,//触发技能
        AWAKEN_SKILL: 2,//觉醒技能
        FREE_SKILL: 3,//自由技能
        MAINATTR_SKILL: 4,//主属性技能
        SECONDATTR_SKILL: 5,//次属性技能
        IMPROVE_SKILL: 6//强化技能
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

    /*1 - 生命
    2 - 攻击
    3 - 防御
    4 - 幸运
    5 - 速度
    6 - 暴击
    7 - 格挡
    8 - 闪避
    9 - 反击*/
    attrId: {
        HP: 1,
        ATTACK: 2,
        DEFENSE: 3,
        SUNDERARMOR: 4,
        SPEED: 5,
        CRITICALHIT: 6,
        BLOCK: 7,
        DODGE: 8,
        COUNTER: 9
    },

    addGhostNumOneMinute: 10,

    MONEY_TYPE: {
        GOLDEN: "1",
        GAME_CURRENCY: "2"
    },

    upgradeApititude: {
        money: 1000,
        gameCurrency: 2
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
        "criticalHit_focus": 32,
        "revive": 33
    },

    buffKind: {
        ITEM: 1,
        SKILL: 2,
        TEAM: 3
    },

    teamType: {
        PLAYER_TEAM: 1,
        MONSTER_TEAM: 2,
        OPPONENT_TEAM: 3
    },

    buffScope: {
        PEASONAL: 1,
        TEAM: 2
    },

    effectName: {
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
        CRITICALHIT_FOCUS: "criticalHit_focus",//暴击几率focus加成
        REVIVE: "revive"
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
        CRITICALHIT_FOCUS: "criticalHit_focus",//暴击几率focus加成
        REVIVE: "revive",
        ADDSPEED: "addspeed",
        REDUCESPEED: "reducespeed"
    },

    buffTypeV2: {
        SHIELDS: "1",//护盾
        EXTRAARMOR: "2",//额外护甲
        BLOCK: "3",//格挡
        DODGE: "4",//闪避
        ASYLUM: "5",//庇护
        ADDMAXHP: "6",//增加血量上限
        REDUCE_SCOPE_DAMAGE: "7",//减范围伤害
        CHANGETO_SCOPE_DAMAGE: "8",//改变为范围伤害
        ADDATTACK: "9",//加攻击力
        ADDSUNDERARMOR: "10",//加护甲
        POISON: "11",//施毒
        ADDHP: "12",//加血
        REDUCEATTACK_ADDSUNDERARMOR: "13",//减攻击力加护甲
        EXTRATARGET: "14",//额外目标
        CHANGETO_SCOPE_DAMAGE_AND_ADDHP: "15",//改变为范围伤害并且加血
        PARALLELDAMAGE: "16",//溅射
        RECOVERYHP: "17",//恢复血量
        PROMOTEHP: "18",//提升血量
        ADDDODGE: "19",//加闪避
        ICE: "20",//冰冻
        SILENCE: "21",//沉默
        AWAKEN_ENHANCE_TRIGGERSKILL: "22",//唤醒触发技能
        FREEZE: "23",//冻结
        TURN_DAMAGE: "24",//反伤
        ADDBLOCK: "25",//增加格挡
        KING_WILL: "26",//君王意志
        IGNORE_SKILL: "27",//忽视技能影响
        ADDDAMAGE: "28",//伤害提升
        IMMUNE_FREEZE: "29",//免疫冻结
        NODAMAGE_EXCEPT_ATTACK: "30",//不承受主动攻击之外的任何伤害
        EXCHANGE_HP_ATTACK: "31",//置换生命值和攻击力
        CHANGETO_SCOPE_DAMAGE_THREETIME: "32",//群体攻击
        OFFSET_SHIELDS: "33",//抵消伤害护盾
        CLEAR_BAD_STATUS: "34",//清除不良状态
        CLEAR_AWAY: "35"//斩杀一个目标
    },

    buffCategory: {
        ATTACK: 1,
        DEFENSE: 2,
        AFTER_ATTACK: 3,
        AFTER_DEFENSE: 4,
        ROUND: 5,
        ATTACKING: 6,
        AWAKEN: 7,
        AFTER_DIE: 8
    },

    characterFightStatus: {
        COMMON: 1,//正常
        FREEZEN: 2//冻结
    },

    characterFightType: {
        ATTACK: 1,
        DEFENSE: 2
    },

    attackType: {
        SINGLE: 1,
        ALL: 2
    },

    skillTriggerConditionType: {
        ATTACK: 1,
        BEATTACKED: 2,
        HP: 3,
        BLOCK: 4,
        DODGE: 5,
        CRITICALHIT: 6,
        COUNTER: 7,
        BATTLE: 8,
        DEATH: 9,
        GETDAMAGE: 10,
        AWAKEN: 11
    },

    /**
     * 1触发技能
     * 2觉醒技能
     * 3先手技能
     * 4主属性强化
     * 5此属性强化
     * 6技能强化
     * 7其他
     */
    onsetType: {
        TRIGGER_SKILL: 1,
        AWAKEN_SKILL: 2,
        SENTE_SKILL: 3,
        MAINATTRIMPROVE_SKILL: 4,
        SECONDORYATTRIMPROVE_SKILL: 5,
        SKILLIMPROVE_SKILL: 6,
        OTHER: 7
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
        32: "criticalHit_focus",
        33: "revive"
    },

    valueType: {
        NUMBER: 1,//"数值"
        PERCENTAGE: 2,//"百分比"
        GETPERCENTAGE: 3//获取目标值(百分比）
    },

    timeType: {
        ATTACK_NUM: 0,//攻击次数
        BEHITTED_NUM: 4,//受攻击次数
        ROUND: 2,//回合
        PERMANENTLY: 3,//永久
        COUNT: 1
    },

    targetType: {
        OWNER_SINGLE: 1,//己方单体
        OPPONENT_SINGLE: 2,//敌方单体
        OWNER_ALL: 3,//己方全体
        OPPONENT_ALL: 4,//敌方全体
        OWNER_RANDOM: 5,//己方随机目标
        OPPONENT_RANDOM: 6,//敌方随机目标
        OWNER_SPECIFIC: 7,//己方特定目标
        OPPONENT_SPECIFIC: 8,//敌方特定目标 1周围1格，2正前，3正后，4左侧，5右侧，6前一行，7同行，8后一行
        SKILL: 10
    },

    targetSpecialType: {
        AROUND_ONE_CELL: 1// 周围1格
    },

    attackSide: {
        OWNER: 1,//己方
        OPPONENT: 2//敌方
    },

    attackAction: {
        common: 1,//普通攻击
        skill: 2,//技能攻击
        addHp: 3
    },

    damageType: {
        common: 1,
        criticalHit: 2,
        extraDamage: 3,
        parallelDamage: 4
    },

    effectTargetType: {
        OWNER: 1,
        OPPONENT: 2
    },

    defenseAction: {//1 - 被击中 2 - 闪避 3 - 被击中反击 4 - 格挡
        beHitted: 1,
        dodge: 2,
        counter: 3,
        block: 4,
        addHp: 5,
        offsetDamage: 6,
        beClearedAway: 7
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