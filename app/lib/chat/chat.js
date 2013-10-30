/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-29
 * Description: chat
 */
var chat_serverConfig = require('../../../shared/config/chat_server');

var env = process.env.NODE_ENV || 'development';
if(chat_serverConfig[env]) {
    chat_serverConfig = chat_serverConfig[env];
}

var chat = module.exports;