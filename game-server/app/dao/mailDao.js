/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-15
 * Time: 上午1:12
 * To change this template use File | Settings | File Templates.
 */
var pomelo = require('pomelo');
var utils = require('../util/utils');
var Mail = require('../domain/mail');
var logger = require('pomelo-logger').getLogger(__filename);
var userDao = require('./userDao');
var lua = require('./lua/redisLua').mailLua;
var crypto = require('crypto');
var MailKeyType = require('../consts/consts').MailKeyType;
var mailDao = module.exports;
/**
 * 获得邮件对象
 * @param msg
 * @returns {Mail}
 */
mailDao.createMail = function (msg) {
	return new Mail(msg);
};

/**
 * 补齐邮件信息
 * @param msg
 * @param cb
 * @constructor
 */
mailDao.Fill = function (msg, cb) {
	mailDao.setTo(msg, cb); //可以写一个函数让他成为链式执行
}

/**
 * 设置接收人的信息
 * @param msg
 * @param cb
 */
mailDao.setTo = function (msg, cb) {
	if (msg.to != null && msg.toName == null) {
		userDao.getNicknameByPlayerId(msg.to, function (err, reply) {
			msg.toName = reply;
			mailDao.setToKey(msg, cb);
		});
	} else if (msg.toName != null && msg.to == null) {
		userDao.getPlayerIdByNickname(msg.serverId, msg.toName, function (err, reply) {
			msg.to = reply;
			mailDao.setToKey(msg, cb);
		});
	}
}

/**
 * 设置接收对象的Key
 * @param msg
 * @param cb
 */
mailDao.setToKey = function (msg, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {}).get(msg.to, function (err, reply) {
			msg.toKey = reply;
            redis.release(client);
			mailDao.setMailId(msg, cb);
		}).exec(function (err, reply) {

        });
	});
}

/**
 * 设置mailId
 * @param msg
 * @param cb
 */
mailDao.setMailId = function (msg, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).incr("mailId", function (err, reply) {
			msg.mailId = reply;
            redis.release(client);
			utils.invokeCallback(cb, null, msg);
		}).exec(function (err, reply) {

        });
	});
}

/**
 * 获得发送邮箱
 * @param key
 * @param start
 * @param end
 * @param cb
 */
mailDao.getOutbox = function (key, start, end, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).lrange(key + "_" + MailKeyType.SEND, start, end, function (err, reply) {
            redis.release(client);
			utils.invokeCallback(cb, null, reply);
		})
		.exec(function (err, reply) {

        });
	});
}

/**
 * 获得接收邮箱
 * @param key
 * @param start
 * @param end
 * @param cb
 */
mailDao.getInbox = function (key, start, end, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {
			var msg = {
				keys : [key + "_" + MailKeyType.HASITEM, key + "_" + MailKeyType.NOREAD, key + "_" + MailKeyType.READ],
				client : client,
				list : new Array(),
				start : start,
				end : end
			};
			mailDao.getMailList(redis, msg, cb);
		});
	});
}

mailDao.getMailList = function (redis, msg, cb) {
	var client = msg.client;
	var key = msg.keys.shift();
	if (key == null || typeof key == undefined) {
        redis.release(client);
		utils.invokeCallback(cb, null, msg.list);
		return;
	}
	client.llen(key, function (err, reply) {
		if (msg.start > reply) {
			msg.start -= reply;
			mailDao.getMailList(redis, msg, cb);
			return;
		}
		client.lrange(key, msg.start, msg.end, function (err, reply) {
			if (reply == undefined) {
				reply = [];
			}
			msg.list = msg.list.concat(reply);
			if ((msg.end = msg.end - msg.start - reply.length) > 0) {
				msg.start = 0;
			} else {
				msg.keys = [];
			}
			mailDao.getMailList(redis, msg, cb);
		});
	});
}

/**
 * 系统发送给玩家
 * @param toBox
 * @param mail
 * @param cb
 */
mailDao.systemSendMail = function (toBox, mail, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	if (mail.items == null || mail.items.length == 0) {
		toBox += "_" + MailKeyType.NOREAD;
		mail.mailId = MailKeyType.NOREAD + mail.mailId;
	} else {
		toBox += "_" + MailKeyType.HASITEM;
		mail.mailId = MailKeyType.HASITEM + mail.mailId;
	}
	var receiveMail = JSON.stringify(mail);
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {}).lpush(toBox, receiveMail, function (err, reply) {
			if (!!err) {
				utils.invokeCallback(cb, "添加收件人邮箱时有错误");
				return;
			}
		}).exec(function (err, reply) {
			if (!!err) {
                redis.release(client);
				utils.invokeCallback(cb, err);
				return;
			}
            redis.release(client);
			utils.invokeCallback(cb, null, mail);
		});
	});
}

/**
 * 玩家发送给玩家
 * @param fromBox
 * @param toBox
 * @param mail
 * @param cb
 */
mailDao.addMail = function (fromBox, toBox, mail, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	var sendMail = JSON.stringify(mail);
	mail.mailId = MailKeyType.NOREAD + mail.mailId;
	var receive = JSON.stringify(mail);
	logger.debug(toBox);
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {})
		.lpush(fromBox, sendMail, function (err, reply) {
			if (!!err) {
				utils.invokeCallback(cb, "添加发送人邮箱有错误");
				return;
			}
		}).lpush(toBox, receive, function (err, reply) {
			if (!!err) {
				utils.invokeCallback(cb, "添加收件人邮箱时有错误");
				return;
			}
		}).exec(function (err, reply) {
			if (!!err) {
                redis.release(client);
				logger.info(err);
				return;
			}
            redis.release(client);
			utils.invokeCallback(cb, null, mail);
		});
	});
}

/**
 * 查看发送箱子有多少件邮件
 * @param Key
 * @param cb
 * @constructor
 */
mailDao.SendMailCount = function (Key, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).llen(Key + "_" + MailKeyType.SEND, function (err, reply) {
			logger.info(reply);
            redis.release(client);
			utils.invokeCallback(cb, null, reply);
		}).exec(function (err, reply) {

        });
	});
}

/**
 * 系统删除发送邮箱里的邮件
 */
mailDao.DelOutboxMail = function (Key, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).rpop(Key + "_" + MailKeyType.SEND, function (err, reply) {
            redis.release(client);
			utils.invokeCallback(cb, null, reply);
		}).exec(function (err, reply) {

        });
	});
}

/**
 * 收件箱子邮件个数
 */
mailDao.ToMailCount = function (Keys, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	var array = [['select', redisConfig.database.SEAKING_REDIS_DB]];
	for (var i in Keys) {
		array.push(['llen', Keys[i]]);
	}
	redis.command(function (client) {
		client.multi(array).exec(function (err, reply) {
			logger.debug(reply);
			var all = 0;
			for (var i = 1; i <= Keys.length; i++) {
				all += reply[i];
			}
            redis.release(client);
			utils.invokeCallback(cb, null, all);
		});
	});
}

/**
 *删除接收邮件
 */
mailDao.DelInboxMail = function (Key, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {}).rpop(Key + "_" + MailKeyType.READ, function (err, reply) {
			if (!!err) {
				client.rpop(Key + "_" + MailKeyType.NOREAD, function (err, reply) {
					if (!!err) {
						client.rpop(Key + "_" + MailKeyType.HASITEM, function (err, reply) {
							if (!!err) {
                                redis.release(client);
								utils.invokeCallback(cb, "删除失败");
								return;
							}
                            redis.release(client);
							utils.invokeCallback(cb, null, reply);
						});
						return;
					}
                    redis.release(client);
					utils.invokeCallback(cb, null, reply);
				});
				return;
			}
			utils.invokeCallback(cb, null, reply);
		}).exec(function (err, reply) {

        });
	});
}

/**
 * 删除邮件的功能
 * @param mails
 * @param Key
 * @param cb
 */
mailDao.delMail = function (mails, Key, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	logger.info(redisConfig.database.SEAKING_REDIS_DB);
	logger.debug(Key + "_" + mails[0]);
	logger.warn(mails[0] + mails[1]);
	redis.command(function (client) {
		logger.warn(redisConfig.database.SEAKING_REDIS_DB);
		client.EVALSHA(LuaSha(lua.delMailLua), 3, redisConfig.database.SEAKING_REDIS_DB, Key + "_" + mails[0], mails[0] + mails[1], function (err, reply) {
			if (err) {
				client.eval(lua.delMailLua, 3, redisConfig.database.SEAKING_REDIS_DB, Key + "_" + mails[0], mails[0] + mails[1], function (err, reply) {
                    redis.release(client);
					utils.invokeCallback(cb, err, reply);
				});
				return;
			}
            redis.release(client);
			utils.invokeCallback(cb, err, reply);
		});
	});
}

/**
 * lua 加密sha1
 * @param lua_script
 * @returns {*}
 * @constructor
 */
function LuaSha(lua_script) {
	var shasum = crypto.createHash('sha1');
	shasum.update(lua_script);
	var lua_script_sha = shasum.digest('hex');
	return lua_script_sha;
}

/**
 * 未读到已读
 * @param mails
 * @param Key
 * @param cb
 */
mailDao.readMail = function (mails, Key, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	mailDao.delMail(mails, Key, function (err, reply) {

		if (err || reply == null) {
			utils.invokeCallback(cb, "不是未读邮件");
			return;
		}
		logger.debug(reply);
		var mail = JSON.parse(reply);
		mail.mailId = MailKeyType.READ + mails[1];
		var mailStr = JSON.stringify(mail);
		insertMail(Key + "_" + MailKeyType.READ, mailStr, cb);
	});
}

/**
 * 插入mail
 * @param Key
 * @param mailStr
 * @param cb
 */
function insertMail(Key, mailStr, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	redis.command(function (client) {
		logger.info(Key);
		logger.error(mailStr);
		logger.warn(redisConfig.database.SEAKING_REDIS_DB);
		client.EVALSHA(LuaSha(lua.insertMailLua), 3, redisConfig.database.SEAKING_REDIS_DB, Key, mailStr, function (err, reply) {
			if (!!err) {
				client.EVAL(lua.insertMailLua, 3, redisConfig.database.SEAKING_REDIS_DB, Key, mailStr, function (err, reply) {
                    redis.release(client);
					utils.invokeCallback(cb, err, reply);
				});
				return;
			}
            redis.release(client);
			utils.invokeCallback(cb, err, reply);
		});
	});
}

/**
 * 领取物品
 * @param Key
 * @param mails
 * @param itemIndex
 * @param player
 * @param cb
 */
mailDao.collectItem = function (Key, mails, itemIndex, player, cb) {
	var redisConfig = pomelo.app.get('redis');
	var redis = pomelo.app.get('redisclient');
	mailDao.delMail(mails, Key, function (err, reply) {
		logger.error(err + ":" + reply);
		if (err) {
			utils.invokeCallback(cb, err);
			return;
		}
		if (reply == null) {
			utils.invokeCallback(cb, "没有有该邮件");
			return;
		}
		var mail = JSON.parse(reply);
		if (mail.items[itemIndex].hasCollect == true) {
			utils.invokeCallback(cb, "已经领过了");
			insertMail(Key + "_" + MailKeyType.HASITEM, reply, function (err, reply) {});
			return;
		}

		var item = mail.items[itemIndex];
		item.hasCollect = 1;
		var i = player.packageEntity.addItemWithNoType(player, item);
		logger.error(i);
		var allCollect = 1;
		for (var i in mail.items) {
			if (mail.items[i].hasCollect == 0) {
				allCollect = 0;
				break;
			}
		}
		logger.info(allCollect);
		if (!!allCollect) {
			//插入err
			mail.mailId = MailKeyType.READ + mails[1];
			insertMail(Key + "_" + MailKeyType.READ, JSON.stringify(mail), function (err, reply) {
				logger.info(err);
				logger.warn(reply);
				if (reply != -1) {
					utils.invokeCallback(cb, null, item);
				}
			});

		} else {
			//插入到erw
			logger.fatal(JSON.stringify(mail));
			insertMail(Key + "_" + MailKeyType.HASITEM, JSON.stringify(mail), function (err, reply) {
				logger.error(err);
				logger.debug(reply);
				if (reply != -1) {
					utils.invokeCallback(cb, null, item);
				}
			});
		}
	});
}
