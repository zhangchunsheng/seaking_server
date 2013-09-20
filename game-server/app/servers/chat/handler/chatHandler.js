/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: chatHandler
 */
var area = require('../../../domain/area/area');
var Code = require('../../../../../shared/code');
var gmDao = require('../../../dao/gmDao');
var consts = require('../../../consts/consts');

var SCOPE = {
    PRI: '49237U',
    AREA: 'IVNAS2',
    ALL: 'G23947'
};
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
    return new ChannelHandler(app, app.get('chatService'));
};

var ChannelHandler = function(app, chatService) {
    this.app = app;
    this.chatService = chatService;
};

function setContent(str) {
    str = str.replace(/<\/?[^>]*>/g,'');
    str = str.replace(/[ | ]*\n/g,'\n');
    return str.replace(/\n[\s| | ]*\r/g,'\n');
}

ChannelHandler.prototype.send = function(msg, session, next) {
    var scope, content, message, channelName, uid, code;
    uid = session.uid;
    scope = msg.scope;
    channelName = getChannelName(msg);
    logger.info(channelName);
    msg.content = setContent(msg.content);
    logger.info(msg.content);
    content = {
        uid: uid,
        content: msg.content,
        scope: scope,
        kind: msg.kind || 0,
        from: msg.from
    };
    var self = this;
    if (scope !== SCOPE.PRI) {
        if(scope == SCOPE.AREA) {
            var serverId = session.get("serverId");
            var registerType = session.get("registerType");
            var loginName = session.get("loginName");
            var playerId = session.get("playerId");

            if(typeof serverId == "undefined") {

            } else {
                var command = [];
                var method = "";
                var arguments = [];
                if(msg.content.indexOf("/command:") == 0) {
                    command = msg.content.split(":");
                    command = command[1].split("|");
                    method = command[0];
                    var arguments = command[1].split(",");

                    logger.info(arguments);
                    if(typeof gmDao[method] == "function") {
                        gmDao[method](self.app, session, arguments, function(err, reply) {
                            next(null, {
                                code: Code.OK
                            });
                        });
                        return;
                    }
                }
            }
        }
        this.chatService.pushByChannel(channelName, content, function(err, res) {
            if(err) {
                logger.error(err.stack);
                code = Code.FAIL;
            } else {
                code = Code.OK;
            }

            next(null, {
                code: code
            });
        });
    } else {
        this.chatService.pushByPlayerName(msg.toName, content, function(err, res) {
            if(err) {
                logger.error(err.stack);
                code = Code.FAIL;
            } else {
                code = Code.OK;
            }
            next(null, {
                code: code
            });
        });
    }
};

var getChannelName = function(msg){
    var scope = msg.scope;
    if (scope === SCOPE.AREA) {
        return channelUtil.getAreaChannelName(msg.currentScene);
    }
    return channelUtil.getGlobalChannelName();
};
