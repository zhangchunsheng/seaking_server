/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-15
 * Time: 上午1:09
 * To change this template use File | Settings | File Templates.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var Code = require('../../../../../shared/code');
var area = require('../../../domain/area/area');
var utils = require('../../../util/utils');
var dbUtil = require('../../../util/dbUtil');
var mailDao = require('../../../dao/mailDao');
var pomelo = require('pomelo');
var MailKeyType = require('../../../consts/consts').MailKeyType;
var messageService = require('../../../domain/messageService');
var handler = module.exports;

/**
 * 系统发送邮件
 * @param msg
 * @param session
 * @param next
 */
handler.systemSendMail = function (msg, session, next) {
	logger.error(msg);
	if (msg.to == null && msg.toName == null) {
		next(null, {
			code: Code.MAIL.NO_RECEIVE_ID
		});
		return;
	}
	//需要验证是否是管理员

	mailDao.Fill(msg, function (err, all) {
		var Key = all.toKey;
		mailDao.ToMailCount([Key + "_ERN", Key + "_ERW", Key + "_ERR"], function (err, reply) {
			if (reply == 200) {
				mailDao.DelInboxMail(all.toKey, function (err, reply) {});
			}
			var mail = mailDao.createMail(all);
			logger.info(mail);
			mailDao.systemSendMail(all.toKey, mail, function (err, reply) {
				next(null, {
					code : "OK",
					mail : reply
				});
				var player;
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
				}
			});
		});
	});
}

/*
 * 测试自动删除邮件
 */
/*
handler.systemDelR = function(msg, session, next) {
    var Key  = picecBoxName(session);
    mailDao.DelInboxMail(Key, function(err, reply) {
        next(null, {
                result: reply
        });
    })
}

handler.systemDelS = function(msg, session, next) {
    var Key = picecBoxName(session);
    mailDao.DelOutboxMail(Key, function(err, reply) {
        next(null, {
            result:reply
        });
    });
}
*/

/**
 * 发送邮件
 * @param msg
 * @param session
 * @param next
 */
handler.sendMail = function (msg, session, next) {
	logger.error(msg);
	if (msg.content.length > 50) {
		next(null, {
            code:Code.FAIL
		});
		return;
	}
	if (msg.to == null && msg.toName == null) {
		next(null, {
            code:Code.FAIL
		});
		return;
	}

	var playerId = session.get('playerId');
	var player = area.getPlayer(playerId);
	if (msg.to == playerId || msg.toName == player.nickname) {
		next(null, {
            code:Code.FAIL
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
	logger.debug(fromKey);
	mailDao.SendMailCount(fromKey, function (err, reply) {
		logger.debug(reply);
		if (reply == 50) {
			mailDao.DelOutboxMail(fromKey, function (err, reply) {});
		}
		mailDao.Fill(msg, function (err, all) {
			var Key = all.toKey;
			mailDao.ToMailCount([Key + "_" + MailKeyType.NOREAD, Key + "_" + MailKeyType.HASITEM, Key + "_" + MailKeyType.READ], function (err, reply) {
				if (reply == 200) {
					mailDao.DelInboxMail(all.toKey, function (err, reply) {});
				}
				var mail = mailDao.createMail(all);
				logger.info(mail);

				mailDao.addMail(fromKey + MailKeyType.SEND, all.toKey + MailKeyType.NOREAD, mail, function (err, reply) {
					if (!!err) {
						logger.debug(err);
						next(null, {
							code : Code.FAIL
						});
						return;
					}
					next(null, {
						code : Code.OK,
						mailId : mail.mailId
					});
					if (area.getPlayer(all.to) != null) {
						//推送到收件人
						messageService.pushMessageByUids(
							[{
                                uid : player.userId,
                                sid : player.serverId
							}],
							"onNewMail", {
                                fromName : mail.fromName,
                                title : mail.title
						    }
                        );
					}
				});
			});
		});
	});
}

/**
 * 获得收件邮箱
 * @param msg
 * @param session
 * @param next
 */
handler.getInbox = function (msg, session, next) {
	var Key = picecBoxName(session);
	//var player = area.getPlayer(playerId);
	mailDao.getInbox(Key, msg.start, msg.end, function (err, reply) {
        if(!!err) {
            next(null, {
                code : Code.FAIL
            });
            return;
        }
		next(null, {
			code : Code.OK,
			inbox : reply
		});
	});

}

/**
 * 获得发送邮箱
 * @param msg
 * @param session
 * @param next
 */
handler.getOutbox = function (msg, session, next) {
	var key = picecBoxName(session);
	mailDao.getOutbox(key, msg.start, msg.end, function (err, reply) {
        if( !!err ) {
            next(null, {
                code : Code.FAIL
            });
            return;
        }
		next(null, {
			code : Code.OK,
			outbox : reply
		});
	});
}

/**
 * 获得字符串
 * @param session
 * @returns {string}
 */
function picecBoxName(session) {
	var playerId = session.get('playerId'),
	serverId = session.get('serverId'),
	registerType = session.get('registerType'),
	loginName = session.get('loginName');

	var characterId = utils.getRealCharacterId(playerId);
	return dbUtil.getPlayerKey(serverId, registerType, loginName, characterId);
}

/**
 * 从未读到已读
 * @param msg
 * @param session
 * @param next
 */
handler.readMail = function (msg, session, next) {
	var mailId = msg.mailId;
	var mails = [mailId.substring(0, 3), mailId.substring(3)];
	if (MailKeyType.NOREAD != mails[0]) {
		next(null, {
			code: Code.MAIL.HAVE_READ
		});
		return;
	}
	var Key = picecBoxName(session);
	logger.info(mails);
	mailDao.readMail(mails, Key, function (err, reply) {
		if (!!err) {
			next(null, {
                code: Code.FAIL
			});
			return;
		}
		next(null, {
			code: Code.OK
		});
	});
}

/**
 * 删除邮件
 * @param msg
 * @param session
 * @param next
 */
handler.delMail = function (msg, session, next) {
	var mailId = msg.mailId;
	var mails = [mailId.substring(0, 3), mailId.substring(3)];

	var Key = picecBoxName(session);
	mailDao.delMail(mails, Key, function (err, reply) {
		if (!!err) {
			next(null, {
				code : Code.FAIL
			});
			return;
		}
		next(null, {
			code : Code.OK
		});
	});
}

/**
 * 查未读以及有物品邮件个数
 * @param msg
 * @param session
 * @param next
 */
handler.hasNewMail = function (msg, session, next) {
	var Key = picecBoxName(session);
	mailDao.ToMailCount([Key + "_" + MailKeyType.NOREAD, Key + "_" + MailKeyType.HASITEM], function (err, reply) {
		if (!!err) {
			next(null, {
				code : Code.FAIL
			});
			return;
		}
		next(null, {
			code : Code.OK,
			count : reply
		});
	});
}

/**
 * 取物品
 * @param msg
 * @param session
 * @param next
 */
handler.collectItem = function (msg, session, next) {
	var itemIndex = msg.itemIndex;
	var mailId = msg.mailId;
	var Key = picecBoxName(session);
	var mails = [mailId.substring(0, 3), mailId.substring(3)];
	if (mails[0] != MailKeyType.HASITEM) {
		next(null, {
            code: Code.FAIL
		});
        return;
	}

	var player = area.getPlayer(session.get("playerId"));
	mailDao.collectItem(Key, mails, itemIndex, player, function (err, reply) {
		if( !!err ) {
            next(null, {
                code: Code.FAIL
            });
            return;
        }
        next(null, {
			code : Code.OK,
			item : reply
		});
	});
}
