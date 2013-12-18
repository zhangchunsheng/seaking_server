/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: code
 */
module.exports = {
    OK: 200,
    FAIL: 500,
    ARGUMENT_EXCEPTION: 101,
    NO_LOGIN: 102,

    ENTRY: {
        FA_TOKEN_ILLEGAL: 1000,
        FA_TOKEN_INVALID: 1001,
        FA_TOKEN_EXPIRE: 	1002,
        FA_USER_NOT_EXIST: 1003,
        NO_CHARACTER: 1004
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    },

    CHAT: {
        FA_CHANNEL_CREATE: 3001,
        FA_CHANNEL_NOT_EXIST: 3002,
        FA_UNKNOWN_CONNECTOR: 3003,
        FA_USER_NOT_ONLINE: 	3004
    },

    BATTLE: {

    },

    PACKAGE: {
        NOT_ENOUGHT_SPACE: 1201,
        NOT_EXIST_ITEM:1202,
        NOT_ENOUGH_ITEM:1203
    },

    EQUIPMENT: {
        NO_ENOUGH_LEVEL: 1220,
        NO_WEAPON: 1221,
        WRONG_WEAPON: 1222,
        NO_UPGRADE: 1223,
        NOMORE_LEVEL: 1224,
        NOT_OWNER_EQUIPMENT: 1225,
        NO_FORGEDATA: 1226,
        FORGEUPGRADE_TOP_LEVEL: 1227,
        NO_UPGRADEMATERIAL: 1228
    },

    SHOP: {
        NOT_ENOUGHT_MONEY: 1101,
        NOT_EXIST_ITEM: 1102,
        NOT_EXIST_NPCSHOP: 1103,
        NOT_ENOUGHT_GAMECURRENCY: 1104,
        WRONG_MONEY_TYPE: 1105
    },

    FRIEND: {
        EXIST_FRIEND: 1301,
        NOT_EXIST_PLAYER: 1302
    },

    TASK: {
        NO_CUR_TASK: 1401,
        HAS_ACCEPTED: 1402,
        NOT_COMPLETE: 1403
    },

    INDU: {
        NOT_AT_INDU: 1501,
        NO_EVENT_EXIST: 1502,
        WRONG_INDU: 1503
    },

    MAIL: {
        HAVE_READ: 1601,
        NO_RECEIVE_ID: 1602
    },

    AREA: {
        WRONG_CURRENTSCENE: 1701
    },

    CHARACTER: {
        EXISTS_NICKNAME: 1801,
        NOMORE_GHOSTNUM: 1802,
        WRONG_DATE: 1803,
        NO_FREETIME_LEFT: 1804,
        TOP_LEVEL: 1805,
        NO_APTITUDEDATA: 1806,
        NO_GHOSTDATA: 1807
    },

    PARTNER: {
        EXISTS_PARTNER: 1810,
        NOT_EXISTS_CID: 1811
    },

    SKILL: {
        HAVED_SKILL: 1820,
        NO_HAVE_SKILL: 1821,
        TOP_LEVEL: 1822,
        NEED_REQUIREMENT: 1823,
        NO_REACH_SKILL: 1824,
        NO_SKILL: 1825
    }
};