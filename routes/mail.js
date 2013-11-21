/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: mail
 */
var mailService = require('../app/services/mailService');
var userService = require('../app/services/userService');

var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var async = require("async");

var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var mailDao = require('../app/dao/mailDao');
var MailKeyType={
    NOREAD:'ERN'
    ,HASITEM:'ERW'
    ,READ:'ERR'
    ,SEND:'ESS'
}
exports.index = function(req, res) {
    res.send("index");
}


/**
 * 系统发邮件
 * @param req
 * @param res
 */
exports.systemSendMail = function(req, res) {
    var msg = req.query;
    var session = req.session;

    if (msg.to == null && msg.toName == null) {
        next(null, {
            code: Code.MAIL.NO_RECEIVE_ID
        });
        return;
    }
    msg.from = '0';
    msg.fromName ='管理员';
    //需要验证是否是管理员

    mailDao.Fill(msg, function (err, all) {
        var Key = all.toKey;
        mailDao.ToMailCount([Key+ "_" + MailKeyType.NOREAD, Key + "_"+MailKeyType.HASITEM, Key + "_"+ MailKeyType.READ], function (err, reply) {
            if (reply >= 200) {
                mailDao.DelInboxMail(all.toKey, function (err, reply) {});
            }
            var mail = mailDao.createMail(all);
            mailDao.systemSendMail(all.toKey, mail, function (err, reply) {
               utils.send(msg,res, {
                    code : "OK",
                    mail : reply
                });
                /*var player;
                if ((player = area.getPlayer(mail.to)) != null) {
                    messageService.pushMessageByUids(
                        [{
                            uid : player.userId,
                            sid : player.serverId
                        }],
                        "onNewMail",
                        {
                            fromName : "系统",
                            title : mail.title
                        }
                    );
                }*/
            });
        });
    });
}

/**
 * 发邮件
 * @param req
 * @param res
 */
var mailIdreg = /([0-9]+)/ig;
exports.sendMail = function(req, res) {
    var msg = req.query;
    var session = req.session;
    console.log("fk");
    if (!msg.content || msg.content.length > 50) {
        utils.send(msg, res, {
            code:Code.FAIL
        });
        return;
    }
    if(!msg.title || msg.title.length> 20) {
        utils.send(msg, res, {
            code: Code.FAIL
        });
        return;
    }
    if (msg.to == null && msg.toName == null) {
       utils.send(msg, res, {
            code:Code.FAIL   
        });
        return;
    }
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    msg.serverId = session.serverId;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        if (msg.to == playerId || msg.toName == player.nickname) {
            utils.send(msg,res, {
                code : Code.FAIL

            });
            return;
        }
        //如果发送来的没有from属性可以设置
        // msg.from = session.get('playerId');
        /*
         var fromMail = mailDao.createMail(session.get('playerId'), msg);
         var fromKey = picecBoxName(session,"_ES");
         mailDao.addMail(fromKey, msg.to, Mail, function(err,reply){
    
         });
         next(null,{
         code:"200"
         });*/
        msg.from = playerId;
        msg.fromName = player.nickname;
        var fromKey = picecBoxName(session);
        mailDao.SendMailCount(fromKey, function (err, reply) {
            if (reply >= 50) {

                mailDao.DelOutboxMail(fromKey,reply-50+1, function (err, reply) {
                    console.log(err);
                });
            }
            mailDao.Fill(msg, function (err, all) {
                var Key = all.toKey;
                mailDao.ToMailCount([Key + "_" + MailKeyType.NOREAD, Key + "_" + MailKeyType.HASITEM, Key + "_" + MailKeyType.READ], function (err, reply) {
                    if (reply >= 200) {
                        mailDao.DelInboxMail(all.toKey);
                    }
                    var mail = mailDao.createMail(all);
                    mailDao.addMail(fromKey + '_'+MailKeyType.SEND, all.toKey +'_'+ MailKeyType.NOREAD, mail, function (err, reply) {
                        if (!!err) {
                            console.log(err);
                            utils.send(msg,res, {
                                code : Code.FAIL
                            });
                            return;
                        }
                        utils.send(msg,res,{
                            code : Code.OK,
                            data:{
                                mailId : mail.mailId,
                                time: mail.time
                            }
                            
                        });
                        
                    });
                });
            });
        });
    });
}

/**
 * 收件箱
 * @param req
 * @param res
 */
var packageNum = 10;
exports.getInbox = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var Key = picecBoxName(session);
    //var player = area.getPlayer(playerId);
    
    var index = msg.index-0 || 0;
    index = parseInt(index);
    var start = index  * packageNum;
    var end = (index+1)* packageNum;
    var keys = [
        Key + "_" + MailKeyType.HASITEM,
        Key + "_" + MailKeyType.NOREAD,
        Key + "_" + MailKeyType.READ
    ];
    mailDao.ToMailCount(keys,
    function(err, r) {
        var allCount = r[0]+r[1]+r[2];
        if(allCount == 0) {
            utils.send(msg, res,{
                code: Code.OK,
                outbox: [],
                P:packageNum,
                C:allCount,
                I:0
            });
            return;
        }
        if(start > allCount) {
            index = Math.floor(allCount /packageNum);
            start = index * packageNum;
        }
        end = (index+1) *  packageNum;

        mailDao.getInbox(keys,r, start, end, function (err, reply) {
            if(!!err) {
                utils.send(msg,res, {
                    code : Code.FAIL
                });
                return;
            }
            utils.send(msg,res,{
                code:Code.OK,
                data:{
                    inbox:reply,
                    P:packageNum,
                    C:allCount,
                    I:index
                }
            })
        });
    },1);
}

/**
 * 发件箱
 * @param req
 * @param res
 */
exports.getOutbox = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var key = picecBoxName(session);
    var index = msg.index - 0 || 0;
    var start = index  * packageNum;
    var end ;
    mailDao.SendMailCount(key,function(err,allCount) {
        if(allCount == 0) {
            utils.send(msg, res,{
                code: Code.OK,
                outbox: [],
                P:packageNum,
                C:allCount,
                I:0
            });
            return;
        }
        if(start > allCount){
            index = Math.floor((allCount-1)/packageNum);
            start = index * packageNum;
        }
        end = (index+1) * packageNum;
        mailDao.getOutbox(key, start, end, function (err, reply) {
            if( !!err ) {
                utils.send(msg,res, {
                    code : Code.FAIL,
                    err:err
                });
                return;
            }
            utils.send(msg,res,{
                code:Code.OK,
                outbox:reply,
                P:packageNum,
                C:allCount,
                I:index
            })
        });

    });
}

/**
 * 获得字符串
 * @param session
 * @returns {string}
 */
function picecBoxName(session) {
    var playerId = session.playerId
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var characterId = utils.getRealCharacterId(playerId);
    return 'S'+serverId+'_T'+ registerType+'_'+ loginName+'_C'+ characterId;
}

/**
 * 读邮件
 * @param req
 * @param res
 */
exports.readMail = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var mailId = msg.mailId;
    var mails = [mailId.substring(0, 3), mailId.substring(3)];
    if (MailKeyType.NOREAD != mails[0]) {
        utils.send(msg, res, {
            code: Code.MAIL.HAVE_READ
        });
        return;
    }
    var Key = picecBoxName(session);
    mailDao.readMail(mails, Key, function (err, reply) {
        if (!!err) {
            utils.send(msg, res, {
                code: Code.FAIL
            });
            return;
        }
        utils.send(msg, res, {
            code: Code.OK,
            mail:reply
        });
    });
}

/**
 * 删除邮件
 * @param req
 * @param res
 */
exports.delMail = function(req, res) {
    var msg = req.query;
    var session = req.session;
    if(!msg.mailId && msg.mailId.length<4) {
        utils.send(msg, res, {
            code: Code.FAIL
        });
        return;
    }
    var mailId = msg.mailId;
    var mails = [mailId.substring(0, 3), mailId.substring(3)];

    var Key = picecBoxName(session);
    mailDao.delMail(mails, Key, function (err, reply) {
        if (!!err) {
           utils.send(msg, res, {
                code : Code.FAIL
            });
            return;
        }
        utils.send(msg, res, {
            code : Code.OK
        });
    });
}

/**
 * 有新邮件
 * @param req
 * @param res
 */
exports.hasNewMail = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var Key = picecBoxName(session);
    mailDao.ToMailCount([Key + "_" + MailKeyType.NOREAD, Key + "_" + MailKeyType.HASITEM], function (err, reply) {
        if (!!err) {
             utils.send(msg, res, {
                code : Code.FAIL
            });
            return;
        }
        var all = 0;
        for (var i = 1; i <= Keys.length; i++) {
            all += reply[i];
        }
         utils.send(msg, res, {
            code : Code.OK,
            count : all
        });
    });
}

/**
 * 获得物品
 * @param req
 * @param res
 */
exports.collectItem = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var itemIndex = msg.itemIndex -0 || 0;
    var mailId = msg.mailId;
    var Key = picecBoxName(session);
    var mails = [mailId.substring(0, 3), mailId.substring(3)];
    if (mails[0] != MailKeyType.HASITEM) {
        next(null, {
            code: Code.FAIL
        });
        return;
    }
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        mailDao.collectItem(Key, mails, itemIndex, player, function (err, reply) {
            if( !!err ) {
                utils.send(msg, res, {
                    code: Code.FAIL
                });
                return;
            }
            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(player.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                utils.send(msg, res, {
                code : Code.OK,
                data : reply
                 });
            });
            
        });
    });
}