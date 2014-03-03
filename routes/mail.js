var mailService = require('../app/services/mailService');
var userService = require('../app/services/userService');

var packageService = require('../app/services/packageService');
var userService = require('../app/services/userService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var async = require("async");
var MailKeyType = require('../app/consts/consts').MailKeyType;
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var mailDao = require('../app/dao/mailDao');
var redis =  require('../app/dao/redis/redis');

var mail = {};

mail.send = function(req, res) {
	var msg = req.query;
    var session = req.session;
    if (!msg.content || msg.content.length > 50) {
        utils.send(msg, res, {
            code:Code.FAIL,
            err:"信息错误"
        });
        return;
    }
    if(!msg.title || msg.title.length> 20) {
        utils.send(msg, res, {
            code: Code.FAIL
            ,err: "信息错误"
        });
        return;
    }
    if (msg.to == null && msg.toName == null) {
       utils.send(msg, res, {
            code:Code.FAIL   
            ,err: "没有发送人"
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
    	/*
        if (msg.to == playerId || msg.toName == player.nickname) {
            utils.send(msg,res, {
                code : Code.FAIL,
                err:"不能发给自己"
            });
            return;
        }
        */
        msg.from = playerId;
        msg.fromName = player.nickname;
        var fromKey = picecBoxName(session);
        mailDao.new(msg, function(err, m) {
            if(err){utils.send(msg, res, {code: Code.FAIL, err:err});return;}
        	mailDao.cleanOutBoxMail(m.fromId);
        	mailDao.cleanInBoxMail(m.toId);
           // msg.mail = m;
            msg.toKey = m.toKey ;
            msg.fromKey = picecBoxName(session);
            console.log("msg",msg);
        	mailDao.send(msg,function(err, mail){
        		if(err){utils.send(msg, res, {code: Code.FAIL, err:err});return;}
        		utils.send(msg, res, {code: Code.OK, data:{mailId:mail.mailId, time: mail.time}});
        	});
        });
        

    });
}

function aToj(array) {
    var jsons = [];
    console.log(array.length)
    for(var i = 0, len = array.length; i< len;i++) {
        if(array[i]){
            jsons.push(JSON.parse(array[i]));
        }else{
           // jsons.push(array[i]);
        }
        
    }
    return jsons;
}
mail.getIn = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var Key = picecBoxName(session);
    msg.box = Key+"_"+MailKeyType.MAILIN;
    mailDao.getAll(msg, function(err, mails) {
        if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
        utils.send(msg, res, {code: Code.OK, data: aToj(mails)});
    });
}

mail.getOut = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var Key = picecBoxName(session);
    msg.box = Key+"_"+MailKeyType.MAILOUT;
    mailDao.getAll(msg, function(err, mails) {
        if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
        utils.send(msg, res, {code: Code.OK, data: aToj(mails)});
    });
}

mail.collectItem = function(req, res) {
   var msg = req.query;
   if(!msg.mailId ) {
        utils.send(msg, res, {code: Code.FAIL, err: "mailId not exist"});return;
    }
    var session = req.session;
    var Key = picecBoxName(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    msg.box = Key+"_"+MailKeyType.MAILIN;
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        mailDao.collectItem(msg, function(err, r) {
            if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
            var changeItems = [];
            var rdata = r.mail;
            var data = {};
            for(var i in rdata.items){
                var item = rdata.items[i];
                var change = player.packageEntity.addItemWithNoType(player, item);
                if(!i) {
                    callback("package error",null);return;
                }
                changeItems.push(change);
            }
            data.changeItems = changeItems;
            var array = [];
            if(rdata.money) {
                player.money += rdata.money;
                array.push(["hset", Key, "money", player.money]);
                data.money = player.money;
            } 
            if(rdata.experience) {
                player.experience += rdata.experience;
                array.push(["hset", Key, "experience", player.experience]);
                data.experience = player.experience;
            }
            array.push(["hset",Key,"package", JSON.stringify(player.packageEntity.getInfo())]);
            //领取事件
            array.push(r.sql);
            console.log(array);
            redis.command(function(client) {
                client.multi(array).exec(function(err){
                    redis.release(client);
                    if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
                    utils.send(msg, res, {code: Code.OK, data: {
                        changeItems: changeItems, 
                        changeMail: r.mail
                    }});
                });
            });
            
        });
    });
}

mail.collectMail = function(req, res) {
    var msg = req.query;
    var session = req.session;
    msg.Key = picecBoxName(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
        var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.playerId = session.playerId;
        msg.nickName =  player.nickname;
        mailDao.collectMail(msg, function(err, r) {
            if(err){utils.send(msg, res, {
                code: Code.FAIL,
                err: err
            });return;}
            utils.send(msg, res, {
                code: Code.OK,
                data: r
            });
        });

    });

}

mail.del = function(req, res) {
    var msg = req.query;
    var mailId = msg.mailId;
    if(!msg.mailId ) {
        utils.send(msg, res, {code: Code.FAIL, err: "mailId not exist"});return;
    }

    var session = req.session;
    var Key = picecBoxName(session);
    var mails = [mailId.substring(0,3), mailId.substring(3)];
    if(mails[0] == MailKeyType.SEND){
        msg.box = Key+"_"+MailKeyType.MAILOUT;
    }else{
        msg.box = Key+"_"+MailKeyType.MAILIN;
    }  
    mailDao.del(msg, function(err, r) {
        if(err){utils.send(msg, res, {code: Code.OK, err: err});return;}
        utils.send(msg, res, {code: Code.OK, data: r});
    });
}

mail.read = function(req, res) {
    var msg = req.query;
    if(!msg.mailId ) {
        utils.send(msg, res, {code: Code.FAIL, err: "mailId not exist"});return;
    }
    var session = req.session;
    var Key = picecBoxName(session);
    msg.box = Key+"_"+MailKeyType.MAILIN;
    mailDao.read(msg, function(err, r) {
        if(err){utils.send(msg, res, {code: Code.FAIL, err: err});return;}
        utils.send(msg, res, {code: Code.OK, data: r});
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


mail._Add = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    msg.serverId = session.serverId;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.from = playerId;
        msg.fromName = player.nickname;
        //mailDao.new(msg, function(err, m) {
            msg.Key = picecBoxName(session);
            mailDao.add(msg, function(err, r){
                if(err){utils.send(msg, res, {code: Code.FAIL});return;}
                utils.send(msg, res, {code: Code.OK, data: r});
            });
       // });
       
    });
}
mail._Set = function(req, res) {
    var msg = req.query;
    var session = req.session;
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    msg.serverId = session.serverId;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player){
        msg.from = playerId;
        msg.fromName = player.nickname;
        msg.Key = picecBoxName(session);
        mailDao.set(msg, function(err, r){
            if(err){utils.send(msg, res, {code: Code.FAIL});return;}
            utils.send(msg, res, {code: Code.OK, data: r});
        });
    });
}
module.exports = mail;
