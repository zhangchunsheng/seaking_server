var utils = require('../utils/utils');
var Mail = require('../domain/mail');
var userDao = require('./userDao');
var lua = require('./lua/redisLua').mailLua;
var crypto = require('crypto');
var MailKeyType = require('../consts/consts').MailKeyType;
var logger =console;
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');
var async = require("async");
var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}

var mailDao = module.exports;



mailDao.new = function(msg, callback) {
	async.series([
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
			if(!reply){
				callback("not find toName");return;
			}
			msg.toName = reply;
			callback(null,msg);
		});
	} else if (msg.toName != null && msg.to == null) {
		userDao.getPlayerIdByNickname(msg.serverId, msg.toName, function (err, reply) {
			if(err){callback("setplayerId err:"+err.message, null);return;}
			if(!reply){
				callback("not find toId");return;
			}
			msg.to = reply;
			callback(null,1);
		});
	}else{
		callback(null, 1);
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
		redis.command(function(client) {
			client.multi(array).exec(function(err, res){
				redis.release(client);
				if(err){callback(err, null);return;}
				callback(null, res[1]);
			});
		});
		
	}else{
		redis.command(function(client){
			mailDao.get(client, msg , function(err, r) {
				if(err){redis.release(client);callback(err, null);return;}
				if(r === null){redis.release(client);callback(null,[]);return;}
				if(!r.index){redis.release(client);callback(null,r);}
				client.lrange(box,0,r.index -1, function(err,res) {
					redis.release(client);
					if(err){callback(err, null);return;}
					callback(null, res);
				});
			}, 1);
		});
		
	}
}

var thresholds = 40;
mailDao.get = function(client, msg, callback, mode){
	console.log("mailId:" , msg.mailId);
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
		if(length==0){
			callback(null,null);
			return;
		}
		if(msg[property] == first[property]) {
			callback(null, {index:0, length:length, data: first});return;//mode or add
		} else if(msg[property].length > first[property].length || (msg[property].length == first[property].length && msg[property]  > first[property] ) ) {
			//callback("not find", null);
			if(mode){callback(null,null);return;}//mode
			callback("not find", null);return;	
		} else if( length == 1 ){
			if(mode){ callback(null, {index: 1,length:length, data: null});return;}
			callback(null, null);return;
		}
		if(msg[property] == last[property]) {
			callback(null, {index:-1, length:length, data: last});return;//mode or add
		} else if(msg[property].length < last[property].length || ( msg[property].length == last[property].length && msg[property] < last[property] ) ) {
			if(mode){callback(null,{index:length, data:null, length:length});return;}
			callback(null,null);return;//mode
		} else if( length == 2 ) {
			if(mode){ callback(null, {index: 1,length:length, data: null});return;}
			callback(null, null);return;
		}
		if(length > thresholds) {
			//mode
			var find = function(start, end) {
 				if(start+1 == end  ){
 					if(mode){
 						callback(null, 	{index:end, data:null, length:length});return;
 					}
 					callback("not find:"+msg[property], null);return;
 				}
 				var m = Math.ceil((start+end)/2);
 				client.lindex(box, m, function(err, rfind){
 					if(err){callback(err,rfind );return;}
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
 					if(start+1==end){
 						if(mode){return end;}
 						return null;
 					}
 					var m = Math.ceil((start+end)/2);
 					var _property = getJson(res[m])[property];
 					if(_property > msg[property]) {
 						return find(m, end);
 					}else if(_property < msg[property]) {
 						return find(start, m);
 					}else{
 						return m;
 					}
 				}
 				var m = find(0, length-1);
 				if(m==null){
 					callback("not find", null);return;
 				}
 				//console.log(msg[property]);
 				//console.log(JSON.parse(res[m]).time);
 				callback(null, {index: m, data: res[m], length: length});
			});
		}

	});
}

mailDao.del = function(msg, callback) {
	redis.command(function(client) {
		mailDao.get(client, msg, function(err, res) {
			if(err){redis.release(client);callback(err,null);return;}
			if(!res){redis.release(client);callback("not find",null);return;}
			var order= 1;
			if(res.index > res.length/2){
				order= -1;
			}
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
			if(!res){redis.release(client);callback("not find",null);return;}
			res = getJson(res);
			var rdata = getJson(res.data);
			rdata.mailId = MailKeyType.READ+mails[1];
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
						if(mail.mailId.substring(0,3) != MailKeyType.HASITEM) {
							array.push(["lrem", box, -1, ,res[i]]);
							if(--num == 0){
								return cb(array);
							}
						}
					}
					for(var i = 0,l = num;i<l;i++) {
						array.push(["lpop",box]);
					}
					return cb(array);
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
			redis.release(client);
			if(err){callback(err,null);return;}
			if(!res){callback("not find",null);return;}
			res = getJson(res);
			var rdata = res.data;
			rdata.mailId = MailKeyType.READ+mails[1];
			callback(null, {mail: rdata,sql:["lset", msg.box, res.index, getString(rdata)]});
		});
	});
}

mailDao.collectMail = function(msg, callback) {
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
					if(err){redis.release(client);callback(err, null);return;}
					mail.mailId = "ERW"+res;
					var array = [];
					array.push(["lpush",msg.Key+"_"+MailKeyType.MAILIN, getString(mail)]);
					client.multi(array).exec(function(err, res) {
						redis.release(client);
						callback(err,mail);
					});
				});
			})		
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

mailDao.add = function(msg, callback , mode){
	var run = function(client) {
		var array = [];
		array.push(["select",redisConfig.database.SEAKING_REDIS_DB]);
		array.push(["incr","mailId"]);
		client.multi(array).exec(function(err, r){

			var type = msg.type;
			var mail  = {
				title: msg.title,
			 	mailId: type+r[1],
			 	content: msg.content,
			 	time: Date.now(),
			 	toName: msg.toName,
			 	to: msg.to,
			 	fromName: msg.fromName,
			 	from: msg.from,
			 	items: msg.items,
			 	type:2
			}
			var toBox;
			if(type != MailKeyType.SEND) {
				toBox = msg.Key +"_"+MailKeyType.MAILIN;
			}else{
				toBox = msg.Key +"_"+MailKeyType.MAILOUT;
			}
			//array=[["select", redisConfig.database.SEAKING_REDIS_DB]];
			//array.push(["lpush", toBox, getString(mail)]);
			array = [["lpush", toBox, getString(mail)]];
			if(mode) {
				callback(err, array[0]);
				return;
			}else{
				array.unshift(["select", redisConfig.database.SEAKING_REDIS_DB]);
				client.multi(array).exec(function(err, res) {
				if(!mode){
					redis.release(client);
				}
				callback(err, res[1]);
				});
				//callback(null, array);
			}
			
			
			
		});
		
	};
	if(mode){
		run(mode);return;
	}else{
		redis.command(run);
	}
	//redis.command();
	
	/*redis.command(function(client) {
		client.multi(array).exec(function(err, res) {
			callback(err, res[1]);
		});

	});*/
}

mailDao.cleanAllInMail = function(msg, callback, mode){
	var run = function(client){
		var array = [["select", redisConfig.database.SEAKING_REDIS_DB]];
		array.push(["del", msg.Key+"_"+MailKeyType.MAILIN]);
		//callback(null, array);
		client.multi(array).exec(function(err, res) {
			if(!mode){
				redis.release(client);
			}			
			callback(err, res);
		});
	};
	if(mode){
		run(mode);
	}else{
		redis.command(run);
	}
	//redis.command = function(client) {
		
	//};
}

mailDao.set = function(msg, callback) {
	redis.command(function(client ) {
		mailDao.cleanAllInMail(msg, function(err) {
			var _msg = {
				title: "系统测试",
			 	content: "系统测试",
			 	time: Date.now(),
			 	toName: msg.toName,
			 	to: msg.to,
			 	fromName: "0",
			 	from: "系统管理员",
			 	Key: msg.Key
			};
			var array = [];
			for(var i = msg.readNum; i>0;i--) {
				var _Rmsg = utils.clone(_msg);
				_Rmsg.type = MailKeyType.READ;
				array.push(function(cb) {
					mailDao.add(_Rmsg, function(err , res) {
						cb(null, res);
					},client); 
				});
			}
			for(var i = msg.noReadNum; i>0;i--) {
				var _Nmsg = utils.clone(_msg);
				_Nmsg.type = MailKeyType.NOREAD;
				array.push(function(cb) {
					mailDao.add(_Nmsg, function(err , res) {
						cb(null, res);
					},client); 
				});
			}
			for(var i = msg.hasItemNum; i>0;i--) {
				var _Imsg = utils.clone(_msg);
				_Imsg.type = MailKeyType.HASITEM;
				array.push(function(cb) {
					mailDao.add(_Imsg, function(err , res) {
						cb(null, res);
					},client); 
				});
			}
			async.series(array, function(err, res) {
				//var marray = res;
				//callback(null ,res);
				client.multi(res).exec(function(err ,r) {
					redis.release(client);
					callback(err, r[r.length-1])

				});
			});
		}, client);
	});
}

/*mailDao.set = function(msg, callback) {
	mailDao.cleanAllInMail(msg, function(err , res) {
		var _msg = {
			title: "系统测试",
		 	content: "系统测试",
		 	time: Date.now(),
		 	toName: msg.toName,
		 	to: msg.to,
		 	fromName: "0",
		 	from: "系统管理员",
		 	type:2,
		 	Key: msg.Key
		};
		// msg.hasItemNum
		async.parallel([
			function(cb){
				var cmsg = utils.clone(_msg);
				cmsg.type = "ERW";
				cmsg.items = [{itemId: "D10010101", itemNum:3},{itemId:"D10010102", itemNum: 50}];
				var array = [];
				for(var i = 1; i>0;i--){
					mailDao.add(cmsg,function(err, r) {
						cb(null , r);
					},1);
				}
			},
			function(cb) {
				for(var i = 1; i>0;i--){
					var cmsg = utils.clone(_msg);
					cmsg.type = "ERN";
					mailDao.add(cmsg,function(err, r) {
						cb(null , r);
					});
				}		
			},
			function(cb) {
				for(var i = 1; i>0;i--){
					var cmsg = utils.clone(_msg);
					cmsg.type = "ERR";
					mailDao.add(cmsg,function(err, r) {
						cb(null , r);
					});
				}
			}
		], function(err, res) {
			callback(null, res);
		});
		
		
		
	});
}*/