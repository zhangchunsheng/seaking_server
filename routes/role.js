/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: role
 */
var roleService = require('../app/services/roleService');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * createMainPlayer
 * @param req
 * @param res
 */
exports.createMainPlayer = function(req, res) {
    var uid = session.uid
        , registerType = session.get('registerType')
        , loginName = session.get('loginName')
        , cId = msg.cId // cId characterId
        , nickname = msg.nickname
        , isRandom = msg.isRandom;// 随机获得昵称
    var self = this;

    //var res = tokenService.parse(token, "pomelo_session_secret");

    logger.info(session);
    var serverId = this.app.get("regionInfo").serverId;

    userDao.is_exists_nickname(this.app, serverId, nickname, function(err, flag) {
        if(flag) {
            next(null, {code: consts.MESSAGE.ERR});
            return;
        }

        userDao.createCharacter(serverId, uid, registerType, loginName, cId, nickname, function(err, character) {
            if(err) {
                logger.error('[register] fail to invoke createPlayer for ' + err.stack);
                next(null, {code: consts.MESSAGE.ERR, error:err});
                return;
            } else {
                var array = [
                    function(callback) {// 初始化武器
                        equipDao.createEquipments(character.id, callback);
                    },
                    function(callback) {// 初始化装备
                        packageDao.createPackage(character.id, callback);
                    },
                    function(callback) {
                        var skillId = 1;
                        character.learnSkill(skillId, callback);
                    }
                ];
                async.parallel(array,
                    function(err, results) {
                        if (err) {
                            logger.error('learn skill error with player: ' + JSON.stringify(character.strip()) + ' stack: ' + err.stack);
                            next(null, {code: consts.MESSAGE.ERR, error:err});
                            return;
                        }
                        afterLogin(self.app, msg, session, {id: uid}, character.getUserInfo(), next);
                    }
                );
            }
        });
    });
}

/**
 * getMainPlayer
 * @param req
 * @param res
 */
exports.getMainPlayer = function(req, res) {
    var token = msg.token, self = this;

    var serverId = this.app.get("regionInfo").serverId;
    if(!token) {
        next(new Error('invalid entry request: empty token'), {code: Code.FAIL});
        return;
    }

    var uid, userInfo, players, player;
    async.waterfall([
        function(cb) {
            // auth token
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function(code, user, cb) {
            // query player info by user id
            if(code !== Code.OK) {
                next(null, {code: code});
                return;
            }

            if(!user) {
                next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
                return;
            }

            user.serverId = serverId;// 选择服务器Id
            uid = user.id;
            userInfo = user;
            userDao.getCharactersByLoginName(self.app, user.serverId, user.registerType, user.loginName, cb);
        }, function(res, cb) {
            // generate session and register chat status
            players = res;
            self.app.get('sessionService').isReconnect(session, uid);
            self.app.get('sessionService').kick(uid, cb);
        }, function(cb) {
            if(!players) {
                players = [];
            }
            logger.info(uid);
            logger.info(userInfo);
            session.bind(uid, cb);
            session.set('serverId', userInfo.serverId);
            session.set('registerType', userInfo.registerType);
            session.set('loginName', userInfo.loginName);
            session.set('ip', session.__session__.__socket__.remoteAddress.ip);
            logger.info(session);
        }, function(cb) {
            if(!players || players.length === 0) {
                next(null, {code: Code.OK, players: null});
                return;
            }

            player = players[0];
            if(!player) {
                player = {};
            }
            session.set('areaId', player.currentScene);
            session.set('playername', player.nickname);
            session.set('playerId', player.id);
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        }, function(cb) {
            self.app.rpc.chat.chatRemote.add(session, player.userId, player.nickname, channelUtil.getGlobalChannelName(), cb);
        }
    ], function(err) {
        if(err) {
            next(null, {code: Code.FAIL});
            return;
        }

        if(players[0] == {})
            players[0] = null;
        next(null, {code: Code.OK, player: players ? players[0] : null});
    });
}