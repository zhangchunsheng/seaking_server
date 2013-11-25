var utils = require('../utils/utils');
var Mail = require('../domain/mail');
var userDao = require('./userDao');
var lua = require('./lua/redisLua').mailLua;
var crypto = require('crypto');
var MailKeyType = require('../consts/consts').MailKeyType;
var logger =console;
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
var async = require("async");

var mailDao = module.exports;



mailDao.new = function(msg, callback) {
	async.parallel([
		function(cb) {
			mailDao.setTo(msg, cb);
		},
		function(cb) {
			mailDao.setMail(msg, cb);
		}
	], function(err, res) {
		if(err){callback(err,null);return;}
		callback(null,msg);
	});
}
mailDao.setTo = function(msg, callback) {
	if (msg.to != null && msg.toName == null) {
		userDao.getNicknameByPlayerId(msg.to, function (err, reply) {
			if(err){callback("setname err:"+err.message, null);return;}
			msg.toName = reply;
			callback(null,msg);
		});
	} else if (msg.toName != null && msg.to == null) {
		userDao.getPlayerIdByNickname(msg.serverId, msg.toName, function (err, reply) {
			if(err){callback("setplayerId err:"+err.message, null);return;}
			msg.to = reply;
			callback(null,1);
		});
	}
}

mailDao.setMail = function(msg, callback) {
	redis.command(function(client) {
		var array = [];
		array.push(["select",redisConfig.database.SEAKING_REDIS_DB]);
		array.push(["get",msg.to]);
		array.push(["incr","mailId"]);
		client.multi(array).exec(function(err, res) {
			redis.release(client);
			if(err){callback(err,null);return;}
			msg.toKey = res[1];
			msg.mailId = res[2];
			callback(null,msg);
		});
	});
}



mailDao.send = function(msg, callback) {
	var smail = new Mail(msg);
	var rmail = utils.clone(smail);
	smail.mailId = MailKeyType.SEND+smail.mailId;
	rmail.mailId= MailKeyType.NOREAD+rmail.mailId;
	var fromBox = msg.fromKey+"_"+MailKeyType.MAILOUT;
	var toBox = msg.toKey+"_"+MailKeyType.MAILIN;
	var array=[["select", redisConfig.database.SEAKING_REDIS_DB]];
	array.push(["lpush", fromBox, getString(smail)]);
	array.push(["lpush", toBox, getString(rmail)]);
	logger.info(array);
	redis.command(function(client){
		client.multi(array).exec(function(err, res) {
			redis.release(client);
			if(err){callback(err, null);return;}
			callback(null,smail);
		}); 
	});
}

mailDao.getAll = function(msg, callback) {
	var box = msg.box;
	if(!msg.time && !msg.mailId) {
		var array = [];
		array.push(["select", redisConfig.database.SEAKING_REDIS_DB]);
		array.push(["lrange", box, 0, -1]);
		console.log(array);
		redis.command(function(client) {
			client.multi(array).exec(function(err, res){
				if(err){callback(err, null);return;}
				callback(null, res[1]);
			});
		});
		
	}else{

		redis.command(function(client){
			mailDao.get(client, msg , function(err, r) {
				if(err){callback(err, null);redis.release(client);return;}
				if(r === null){callback(null,[]);return;}
				console.log("r:"+getString(r) );
				client.lrange(box,0,r.index -1, function(err,res) {
					redis.release(client);
					if(err){callback(err, null);return;}
					callback(null, res);
				});
			});
		});
		
	}
}
var thresholds = 40;
mailDao.get = function(client, msg, callback,mode){
	var box = msg.box;
	var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
	array.push(["llen", box]);
	array.push(["lindex",box,0]);
	array.push(["lindex",box,-1]);
	var property = msg.mailId?"mailId":"time";
	client.multi(array).exec(function(err, res) {
		if(err){callback(err,null); return;}
		var length = res[1];
		var first = getJson(res[2]);
		var last = getJson(res[3]); 
		if(length==0){callback(null,null);return;}//mode
		if(msg[property] == first[property]) {
			callback(null, {index:0, length:length, data: first});return;//mode or add
		} else if(  msg[property]  > first[property] || (length == 1 && mode) ) {
			callback(null,null);return;//mode
		}

		if(msg[property] == last[property]) {
			callback(null, {index:-1, length:length, data: last});return;//mode or add
		} else if( msg[property] < last[property] || (length == 2 && mode) ) {
			callback(null,null);return;//mode
		}

		if(length > thresholds) {
			//mode
			var find = function(start, end) {
 				if(start+1 == end){callback("not find:"+msg[property], null);return;}
 				var m = Math.ceil((start+end)/2);
 				client.lindex(key1, m, function(err, rfind){
 					rfind = JSON.parse(rfind);
 					if(rfind[property] > msg[property]) {
 						return find(m , end);
 					}else if(rfind[property] < msg[property]) {
 						return find(start, m);
 					}else{
 						callback(null , {index: m, data: rfind, length: length});
 					}
 				});
 			}
 			 find(0, length);
		}else{
			client.lrange(box, 0 , -1 , function(err, res) {
				if(err){callback(err,res );return;}
				//mode diffrent
 				var find = function(start, end){
 					if(start+1==end){callback("not find:"+msg[property],null);return;}
 					var m = Math.ceil((start+end)/2);
 					var mailId = getJson(res[m])[property];
 					if(mailId > msg[property]) {
 						return find(m, end);
 					}else if(mailId < msg[property]) {
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

mailDao.del = function(msg, callback) {
	redis.command(function(client) {
		mailDao.get(client, msg, function(err, res) {
			if(err){redis.release(client);callback(err,null);return;}
			var order= 1;
			if(res.index > res.length/2){
				order= -1;
			}
			console.log(["lrem", msg.box, order, res.data]);
			client.lrem(msg.box,order, getString(res.data), function(err) {
				redis.release(client);
				if(err){callback(err,null);return;}
				callback(null,res.data);
			});
		});
	});
	
}

mailDao.read = function(msg, callback) {
	var mailId = msg.mailId;
	var mails = [mailId.substring(0, 3), mailId.substring(3)];
	if(mails[0] != MailKeyType.NOREAD) {
		callback("不是未读邮件",null);return;
	}
	redis.command(function(client) {
		mailDao.get(client, msg, function(err, res) {
			if(err){redis.release(client);callback(err,null);return;}
			res = getJson(res);
			var rdata = getJson(res.data);
			console.log( rdata.mailId);
			rdata.mailId = MailKeyType.READ+mails[1];
			console.log(["lset", msg.box, res.index, rdata]);
			client.lset(msg.box,res.index, getString(rdata), function(err, r) {
				redis.release(client);
				callback(err, rdata);
			});
		});
	});
}

mailDao.cleanOutBoxMail = function(key, callback) {
	var box = key+"_"+MailKeyType.MAILOUT;
	redis.command(function(client) {
		mailDao.getBoxNum(client, box, function(err , res){
			if(err) {redis.release(client);callback(err, null);return;}
			if(res > 50) {
				client.lpop(box, function(err) {
					redis.release(client);
				});
			}else{
				redis.release(client);
			}			
		});
		
	});
}

mailDao.getBoxNum = function(client, box, callback) {
	var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
	array.push(["llen", box]);
	client.multi(array).exec(function(err, res) {
		if(err) {callback(err, null);return;}
		callback(null, res[1]);
	});
}

mailDao.cleanInBoxMail	 = function(key, callback) {
	var box = key+"_"+MailKeyType.MAILIN;
	redis.command(function(client) {
		mailDao.getBoxNum(client, box, function(err, res) {
			if(err) {callback(err, null);return;}
			if(res > 200) {
				var num = res-200+1;
				var array =[];
				function cb(array) {
					client.multi(array).exec(function(err, res){
						if(err){redis.release(client);return;}
						callback(null,res);
					});
				}
				client.lrange(box, 0, -1, function(err, res) {
					if(err){callback(err,null);return;}
					for(var i= res.length-1; i> 0;i--) {
						var mail = getJson(res[i]);
						if(mail.mailId.substring(0,3) == MailKeyType.READ) {
							array.push(["lrem", box, -1, ,res[i]]);
							if(--num == 0){
								return cb(array);
							}
						}
					}
				});
			}else{
				redis.release(client);
			}
		});
	})

}
mailDao.collectItem = function(msg, callback) {
	var mailId = msg.mailId;
	var mails = [mailId.substring(0,3), mailId.substring(3)];
	if(mails[0] != MailKeyType.HASITEM) {
		callback("没有该邮件",null);return;
	}
	redis.command(function(client) {
		mailDao.get(client, msg, function(err, res) {
			if(err){redis.release(client);callback(err,null);return;}
			res = getJson(res);
			var rdata = res.data;
			callback(null, {sql:sql});
		});
	});
}

function getJson(str) {
	if(typeof str == "string") {
		return JSON.parse(str);
	}
	return str;
}

function getString(json) {
	if(typeof json != "string") {
		return JSON.stringify(json);
	}
	return json;
}