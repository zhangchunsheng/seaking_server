/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-15
 * Time: 上午1:12
 * To change this template use File | Settings | File Templates.
 */
var utils = require('../utils/utils');
var Mail = require('../domain/mail');
var userDao = require('./userDao');
var lua = require('./lua/redisLua').mailLua;
var crypto = require('crypto');
var MailKeyType = require('../consts/consts').MailKeyType;

var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

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
	/*async.parallel([
		function(callback) {
			mailDao.setTo(msg, callback);
		},
		function(callback) {
			mailDao.setToKey(msg, callback);
		},
		function(callback) {
			mailDao.setMailId(msg,callback);
		}
	], function(err, res) {
		if(err){cb(err,null);return;}
		cb(null,msg);
	});*/
}

/**
 * 设置接收人的信息
 * @param msg
 * @param cb
 */
mailDao.setTo = function (msg, cb) {
	if (msg.to != null && msg.toName == null) {
		userDao.getNicknameByPlayerId(msg.to, function (err, reply) {
			if(err){cb("setname err:"+err.message, null);return;}
			msg.toName = reply;
			mailDao.setToKey(msg, cb);
		});
	} else if (msg.toName != null && msg.to == null) {
		userDao.getPlayerIdByNickname(msg.serverId, msg.toName, function (err, reply) {
			if(err){cb("setplayerId err:"+err.message, null);return;}
			msg.to = reply;
			console.log("callback:"+reply);
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
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {}).get(msg.to, function (err, reply) {
			if(err){cb("setToKey err:"+err.message, null);return;}
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
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).incr("mailId", function (err, reply) {
        	if(err){cb("setMailId:"+err.message, null);return;}
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
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).lrange(key + "_" + MailKeyType.SEND, start, end, function (err, reply) {
            redis.release(client);
			utils.invokeCallback(cb, null, reply);
		}).exec(function (err, reply) {

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

mailDao.getInbox = function(keys, nums, start, end, callback){
	//keys=[W,N,R]
	var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
	if(start>=nums[0]){
		start -= nums[0];
		end -=nums[0];
		if(start>=nums[1]) {
			start -= nums[1];
			end -= nums[1];
			//都在read里面
			array.push(["lrange", keys[2], start, end]);
		}else{
			array.push(["lrange", keys[1], start, end]);
			if(end >= nums[1]){
				start = 0;end -= nums[1];
				array.push(["lrange", keys[2], start, end]);
			}
		}

	}else{
		if(end >= nums[0]){
			array.push(["lrange", keys[0], start, nums[0]]);
			start = 0;end -= nums[0];
			array.push(["lrange" ,keys[1], start, end]);
			if(end>= nums[1]){
				end -= nums[1];
				array.push(["lrange", keys[2], start, end]);
			}

		}else{
			//都在item里面
			array.push(["lrange",keys[0], start, end]);
		}
		
	}
	redis.command(function(client){
		client.multi(array).exec(function(err, res){
			redis.release(client);
			if(err){callback(err,null);return;}
			var rarray = [];
			for(var i = 1,l =res.length; i < l ; i++) {
				rarray = rarray.concat(res[i]);
			}
			callback(null,rarray);
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
	var cmail = utils.clone(mail);
	cmail.mailId = MailKeyType.SEND+cmail.mailId;
	var sendMail = JSON.stringify(cmail);
	mail.mailId = MailKeyType.NOREAD + mail.mailId;
	var receive = JSON.stringify(mail);
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
            redis.release(client);
			if (!!err) {
				console.log(err);
				return;
			}
            console.log('addMail ###### '+reply);
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
	redis.command(function (client) {
		client.multi().select(redisConfig.database.SEAKING_REDIS_DB, function (err, reply) {

        }).llen(Key + "_" + MailKeyType.SEND, function (err, reply) {
			console.log(reply);
            redis.release(client);
			utils.invokeCallback(cb, null, reply);
		}).exec(function (err, reply) {

        });
	});
}

/**
 * 系统删除发送邮箱里的邮件
 */
mailDao.DelOutboxMail = function (Key,num, cb) {
	var array = [];
	array.push(["select", redisConfig.database.SEAKING_REDIS_DB]);
	for(var i = 0,l =num;i<num ;i++){
		array.push(["rpop",Key + "_" + MailKeyType.SEND]);
	}
	redis.command(function (client) {
		client.multi(array).exec(function (err, reply) {
			redis.release(client);
			utils.invokeCallback(cb, null, reply);
        });
	});
}

/**
 * 收件箱子邮件个数
 */
mailDao.ToMailCount = function (Keys, cb, mode) {
	var array = [['select', redisConfig.database.SEAKING_REDIS_DB]];
	for (var i in Keys) {
		array.push(['llen', Keys[i]]);
	}
	redis.command(function (client) {
		client.multi(array).exec(function (err, reply) {
			redis.release(client);
			if(err) {utils.invokeCallback(err,null);return;}
			if(mode) {
				reply.shift();
				utils.invokeCallback(cb, null, reply);return;
			}
           	var all = 0;
			for (var i = 1, l = Keys.length; i < l; i++) {
				all += reply[i];
			}
			utils.invokeCallback(cb, null, all);
			
		});
	});
}


mailDao.DelInboxMail = function(Key) {
	var array =[
        Key + "_" + MailKeyType.HASITEM,
        Key + "_" + MailKeyType.NOREAD,
        Key + "_" + MailKeyType.READ
    ];
	mailDao.ToMailCount(array, function(err, all){
		if(err)return;
		if(all >= 200){
			redis.command(function(client) {
				mailDao.clean(array, all-200+1, client);
			});
		}
	});
};
mailDao.clean = function(keys, num, client) {
	if(keys == null || num == 0) {
		redis.release(client);
		return;
	}
	client.rpop(keys[0],function(err, res) {
		if(err){
			redis.release(client);
			return;
		}
		if(!res){
			keys.shift();
			mailDao.clean(keys, num, client);
		}else{
			mailDao.clean(keys, --num, client);	
		}
	});
}


/**
 * 删除邮件的功能
 * @param mails
 * @param Key
 * @param cb
 */
mailDao.delMail = function(mails, Key, cb) {
	redis.command(function(client) {
		mailDao.del(client, mails,Key, function(err, res){
			redis.release(client);
			cb(err, res);
		});
	});
}
 mailDao.del = function(client, mails, Key, cb, mode) {
 	mailDao.get(client, Key+"_"+mails[0], mails[0]+mails[1], function(err, res) {
 		if(err){cb(err,res);return;}
 		var order = 1;
 		if(res.index > res.length/2) {
 			order = -1;
 		}
 		var sql = ["lrem", Key+"_"+mails[0], order, getstring(res.data)];
 		if(mode) {
 			cb(null, sql);
 		}else{
 			client.multi([sql]).exec(function(err, r) {
 				cb(err, res);
 			});
 		}
 	});
 }
/*mailDao.delMail = function (mails, Key, cb) {
	redis.command(function (client) {
		client.eval(lua.delMailLua, 3, redisConfig.database.SEAKING_REDIS_DB, Key + "_" + mails[0], mails[0] + mails[1], function (err, reply) {
	        redis.release(client);
			utils.invokeCallback(cb, err, reply);
		});	
	});
}*/



/**
 * 未读到已读
 * @param mails
 * @param Key
 * @param cb
 */

 function getjson(object) {
 	if(typeof object == "string") {
 		return JSON.parse(object);
 	}
 	return object;
 }
 mailDao.readMail = function(mails, Key, cb) {
 	if(mails[0] == MailKeyType.NOREAD) {
 		redis.command(function(client) {
 			mailDao.get(client, Key+"_"+mails[0], mails[0]+mails[1],function(err, res){
 				if(err) {redis.release(client);cb(err, null);return;}
 				if(!res.data) {
 					redis.release(client);cb("not find",null);return;
 				}
 				var data = res.data;
 				var rdata= getjson(data);
 				var array = [];
 				if(res.index > (res.length/2)) {
 					array.push(["LREM",Key+"_"+mails[0], 1, getstring(data)]);
 				}else{
 					array.push(["LREM",Key+"_"+mails[0], -1, getstring(data)]);
 				}
 				rdata.mailId = MailKeyType.READ+mails[1];
 				mailDao.insert(client, Key+"_"+MailKeyType.READ, rdata, function(err, res){
 					if(err){redis.release(client);cb(err,null);return;}
 					array.push(res);
 					client.multi(array).exec(function(err, res) {
 						redis.release(client);
 						if(err){cb(err,null);return;}
 						cb(null, rdata);
 					});
 				},1);
 			});
 		});
 	}else{
 		redis.command(function(client) {
	 		mailDao.get(client, Key+"_"+mails[0], mails[0]+mails[1],function(err, res){
				redis.release(client);
	 			if(err){cb(err,null);return;}
	 			cb(null,res.data);
	 		});
 		});
 	}
 };
 function getstring(object) {
 	if(typeof object != "string") {
 		return JSON.stringify(object);
 	}
 	return object;
}
 	
mailDao.insert = function(client, key1, key2, callback, mode) {
	var array = [["select",redisConfig.database.SEAKING_REDIS_DB]];
	array.push(["llen",key1]);
	array.push(["lindex",key1, 0]);
	array.push(["lindex",key1, -1]);
	console.log(array);
	client.multi(array).exec(function(err, res) {
		if(err){callback(err,null);return;}
		res.shift();
		var length = res[0];
		if(length ==0) {
			var sql = ["lpush",key1,getstring(key2)];
			if(mode) {
				callback(null, sql);return;
			}else{
				client.multi([sql]).exec(function(err, res){
					callback(err, res);
				});
				return;
			}
		}
		var time = key2.time;
		var order = "AFTER";
		var index;
		function cb( order, data){
			var sql = ["LINSERT",key1,order, getstring(data),getstring(key2) ];
			console.log(sql);
			if(mode){
				callback(null,sql);
			}else{
				client.multi([sql]).exec(function(err, res){
					callback(err, res);
				});
			}
		}
		if(getjson(res[1]).time < time) {
			index = 0;
			order = "BEFORE";
			cb(order, res[1]);
		}else if(JSON.parse(res[2]).time > time) {
			index = length -1;
			cb(order, res[2]);
		}else{
			if(length > getNum) {
				var find = function(start, end) {
					var m = Math.ceil((start+end)/2);
					client.lindex(key1,m , function(err, res) {
						if(err){callback(err, null);return;}
						res = JSON.parse(res);
						if(res.time > time) {
							if(m+1==end){cb("AFTER",res);return;}
							 find(m,end);
						}else if(res.time < time) {
							if(start+1==m){cb("BEFORE",res);return;}
							 find(start, m);
						}else{
							cb(order, res);
						}
					});
				}
				find(0, length-1);
			}else{
				client.lrange(key1, 0, -1, function(err, res) {
					if(err){callback(err, null);return;}
					 function find (start, end) {
						if(start +1 == end) {
							return start;
						}
						var m = Math.ceil((start+end)/2);
						var json = JSON.parse(res[m]);
						if(json.time > time) {
							return find(m,end);
						}else if(json.time < time) {
							return find(start,m);
						}else{
							return m;
						}
					}
					var c = find(0,length-1);
					cb(order, res[c]);
				});
			}
		}
	});
}
var getNum = 40;
 mailDao.get = function(client, key1, key2, callback) {
 	var array = [['select', redisConfig.database.SEAKING_REDIS_DB]];
 	array.push(["llen", key1]);
 	array.push(["lindex",key1, 0]);
 	array.push(["lindex",key1, -1]);
 	client.multi(array).exec(function(err, res){
 		if(err){callback(err, res);return;}
 		res.shift();
 		var length =res[0];
 		if(length == 0){
 			callback(null,{index:0, data:null, length:length});
 			return;
 		}
 		var m1 = getjson(res[1]).mailId;
 		if(m1 == key2) {
 			callback(null,{index: 0, data: res[1], length: length});return;
 		}else if(m1 < key2 || length ==1) {
 			callback("not find",null);return;
 		}
 		var m2 = getjson(res[2]).mailId;
 		if(m2 == key2) {
 			callback(null,{index: length-1, data: res[2], length: length});return;
 		}else if(m2 > key2 || length == 2){
 			callback("not find", null);return;
 		}
 		if(length > getNum) {
 			var find = function(start, end) {
 				if(start+1 == end){callback("not find:"+key2, null);return;}
 				var m = Math.ceil((start+end)/2);
 				client.lindex(key1, m, function(err, rfind){
 					rfind = JSON.parse(rfind);
 					if(rfind.mailId > key2) {
 						return find(m , end);
 					}else if(rfind.mailId < key2) {
 						return find(start, m);
 					}else{
 						callback(null , {index: m, data: rfind, length: length});
 					}
 				});
 			}
 			 find(0, length);
 		}else {
 			client.lrange(key1, 0 ,-1, function(err, res){
 				if(err){callback(err,res );return;}
 				var find = function(start, end){
 					if(start+1==end){callback("not find:"+key2,null);return;}
 					var m = Math.ceil((start+end)/2);
 					var mailId = getjson(res[m]).mailId;
 					if(mailId > key2) {
 						return find(m, end);
 					}else if(mailId < key2) {
 						return find(start, m);
 					}else{
 						return m;
 					}
 				}
 				var m = find(0, length-1);
 				callback(null, {index: m, data: res[m], length: length});
 			});
 			
 		}
 	});
 }
/*mailDao.readMail = function (mails, Key, cb) {
    if(mails[0]==MailKeyType.NOREAD ){
        mailDao.delMail(mails, Key, function (err, reply) {
    
            if (err || reply == null) {
                utils.invokeCallback(cb, "不是未读邮件");
                return;
            }
            var mail = JSON.parse(reply);
            mail.mailId = MailKeyType.READ + mails[1];
            var mailStr = JSON.stringify(mail);
            insertMail(Key + "_" + MailKeyType.READ, mailStr);
            utils.invokeCallback(cb,null,mail.mailId);
        });
    }else{
        redis.command(function(client) {
             client.eval(readMailLua,function(err, res){
                redis.release(client);
                 utils.invokeCallback(cb,null,res);
             });
        });
    }
}*/

/**
 * 插入mail
 * @param Key
 * @param mailStr
 * @param cb
 */
/*function insertMail(Key, mailStr, cb) {
	redis.command(function (client) {
		client.EVAL(lua.insertMailLua, 3, redisConfig.database.SEAKING_REDIS_DB, Key, mailStr, function (err, reply) {
            redis.release(client);
			utils.invokeCallback(cb, err, reply);
		});
	});
}*/

/**
 * 领取物品
 * @param Key
 * @param mails
 * @param itemIndex
 * @param player
 * @param cb
 */

 mailDao.collectItem = function(Key, mails, index, player, cb) {
 	redis.command(function(client) {
 		mailDao.get(client, Key+"_"+mails[0], mails[0]+mails[1], function(err, res) {
 			if(err){redis.release(client);cb(err,null);return;}
 			if(!res){redis.release(client);cb("not find",null);return;}
 			var mail = getjson(res.data);
 			mail.items = getjson(mail.items);
 			var item = mail.items[index];
 			if(item.hasCollect) {
 				utils.invokeCallback(cb, "已经领过了");
 				return;
 			}
 			
 			if(!item) {
 				utils.invokeCallback(cb, "没有该物品!");
 				return;
 			}
 			item.hasCollect = 1;
 			var v = false;
			for(var i = 0, l= mail.items.length;i<l;i++) {
				if(!mail.items[i].hasCollect){
					v = true;
				}
			}
			var sql;
			var i = player.packageEntity.addItemWithNoType(player, item);
			if(v){
				sql = ["lset", Key+"_"+mails[0], res.index, getstring(mail)];
				/*redis.release(client);
				cb(null, {changeMail:data, addItem:item, sql: sql});*/
				client.multi([sql]).exec(function(err, res){
					redis.release(client);
					if(err){cb(err,null);return;}
					cb(null,{changeMail:mail, changItem: i});
				});

			}else{
				var array =[];
				var order = 1;
				if(res.index > res.length/2){
					order = -1;
				}
				array.push(["lrem", Key+"_"+MailKeyType.HASITEM,order,res.data]);
				mail.mailId = MailKeyType.READ+mails[1];
				mailDao.insert(client, Key+"_"+MailKeyType.READ,mail , function(err, re) {
					if(err){redis.release(client);cb(err,null);return;}
					array.push(re);
					client.multi(array).exec(function(err, r) {
						redis.release(client);
						if(err){cb(err,null);return;}
							console.log(r);
							cb(null,{changeMail:mail, changeItem: i});

					});
					//sql = ["eval", insertLua, "P"+playerId+"_"+MailConstant.READ,data];
				},1);
			}
 		});
 	});
 }

 mailDao.sendAll = function(msg, callback) {
 	var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
 	if(msg.data.items) {
 		array.push(["keys","*_ERW"]);
 	}else{
 		array.push(["keys","*_ERN"]);
 	}
 	redis.command(function(client) {
 		client.multi(array).exec(function(err, res) {
 			new MailObject(msg.data).full();
 		});
 	});
 }
/*mailDao.collectItem = function (Key, mails, itemIndex, player, cb) {
	mailDao.delMail(mails, Key, function (err, reply) {
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
		var allCollect = 1;
		for (var i in mail.items) {
			if (mail.items[i].hasCollect == 0) {
				allCollect = 0;
				break;
			}
		}

		if (!!allCollect) {
			//插入err
			mail.mailId = MailKeyType.READ + mails[1];
			insertMail(Key + "_" + MailKeyType.READ, JSON.stringify(mail), function (err, reply) {
				if (reply != -1) {
					utils.invokeCallback(cb, null, item);
				}
			});

		} else {
			//插入到erw
			insertMail(Key + "_" + MailKeyType.HASITEM, JSON.stringify(mail), function (err, reply) {
				if (reply != -1) {
					utils.invokeCallback(cb, null, item);
				}
			});
		}
	});
}*/

mailDao.collectMail = function(msg, cb) {
	var mail ={
		"from": "0",
		"fromName":"管理员",
	    "to": msg.playerId,
	    "title": "系统礼物",
	    "time": Date.now(),
	    "content": "欢迎来到wozlla时空,这是给你的新手礼物！请收好",
	    "items":[{itemId: "D10010101", itemNum:3},{itemId:"D10010102", itemNum: 50}],
	    "type": 2,
	    "toName": msg.nickName
		};
	redis.command(function(client) {
		client.select(redisConfig.database.SEAKING_REDIS_DB,function(){
			client.incr("mailId", function(err, res) {
				if(err){cb(err, null);return;}
				mail.mailId = "ERW"+res;

				var array = [];
				array.push(["lpush",msg.Key+"_"+MailKeyType.HASITEM, getstring(mail)]);
				client.multi(array).exec(function(err, res) {
					redis.release(client);
					cb(err,mail);
				});
			});

		})
		
		
	});

}
