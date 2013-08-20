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

    ENTRY: {
        FA_TOKEN_INVALID: 	1001,
        FA_TOKEN_EXPIRE: 	1002,
        FA_USER_NOT_EXIST: 	1003
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    },

    CHAT: {
        FA_CHANNEL_CREATE: 		3001,
        FA_CHANNEL_NOT_EXIST: 	3002,
        FA_UNKNOWN_CONNECTOR: 	3003,
        FA_USER_NOT_ONLINE: 	3004
    },

    BATTLE: {

    },

    PACKAGE: {
        NOT_ENOUGHT_SPACE: 1201,
        NOT_EXIST_ITEM:1202,
        NOT_ENOUGH_ITEM:1203
    },

    SHOP: {
        NOT_ENOUGHT_MONEY: 1101,
        NOT_EXIST_ITEM:1102
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
        NO_EVENT_EXIST: 1502
    },

    EQUIPMENT: {

    }
};