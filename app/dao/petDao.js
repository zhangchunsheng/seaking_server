var dataApi = require("../utils/dataApi");
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');
var mailDao = require("./mailDao");

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}


exports.gmUpgrade = function(data, player, callback) {	
	var pets = player.pets,
		pet = pets.get(data.index),
		upgradLevel = (data.uLevel - 0) || 5;
		console.log(player.pets);
	if(!pet) {
		return callback("The absence of pets");
	}
	pet.level+=upgradLevel;
	var setArray =[
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err) {
			redis.release(client);
			callback(err, pet);
		});
	});
}

exports.gmAdd = function(data, player, callback) {
	var pets  = player.pets;
	var petInfo = dataApi.pets.findById(data.id);
	var upgradeInfo = dataApi.petsUpgrade.findById(data.id);
	var pet = {
		level : 10,
		status : [40,40,40],
		skillLevels: [1,0,0,0,0,0],
		name : petInfo.name,
		id : data.id,
		type : petInfo.type,
		exp : 250,
		updateTime: Date.now(),
		endTime: Date.now()
	}
	pets.push(pet);
	var setArray =[
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err) {
			redis.release(client);
			callback(err, pets);
		});
	});
}

exports.setName = function(data, player, callback) {
	var pets = player.pets,
		pet = pets.get(data.index);
	if(!pet) {
		return callback("The absence of pets");
	}
	pet.name  = data.name;
	pets.update();
	var setArray =[
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {pets: pets.pets});
		});
	});
}

exports.release = function(data, player, callback) {
	var pets = player.pets,
		pet = pets.get(data.index);
	if(!pet) {
		return callback("The absence of pets");
	}
	if(data.index < 0 || data.index > pets.length) {
		return callback("data is error!");
	}

	pets = pets.remove(data.index);
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var petInfo = dataApi.pets.findById(pet.id);
	player.money +=(petInfo.releaseMoney);
	var changeItems = [];
	var tasks = [];
	for(var i = 0 ; i <2 ; i++) {
		if(petInfo["releaseItem"+i] !== "" ) {
			var splitResult = petInfo["releaseItem"+i].split("|");
			var item = {
				itemId : splitResult[0],
				itemNum: (splitResult[1]-0) || 1,
				level: 1
			}
			var changeItem = player.packageEntity.addItemWithNoType(player, item);
			//changeItems.push(changeItem.index);
			if(changeItem == null || changeItem.index.length == 0 ) {
				return callback("item package not enough");
			}
			changeItems = changeItems.concat(changeItem.index);
			tasks.push(changeItems.task);
		}
	}

	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pet: pet,
				pets: pets.pets,
				money : player.money,
				changeItems: changeItems
			});
		});
	});
	
}

var partnerUtil = require("../utils/partnerUtil");
var hasPlayer = function(playerId, player) {
	if(playerId == player.id) {
		return true;
	}
	var character = partnerUtil.getPartner(playerId, player);
	if(!character) {
		return false;
	}
	return true;
}

exports.play = function(data, player, callback) {
	var pets = player.pets,
		pet = pets.get(data.index);
	pets.update();
	if(!hasPlayer(data.playerId, player)) {
		return callback("no have the player");
	}
	if(!pet) {
		return callback("The absence of pets");
	}
	if(pet.playerId == data.playerId){
		return callback(null, {
			pets:pets
		});
	}
	var _pet = pets.finePlayerId(data.playerId);
	pet.playerId = data.playerId;
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pets: pets.pets
			});
		});
	});
}
/*exports.learnSkill = function(data, player, callback) {
	var pets = player.pets, pet = pets[data.index];
	var skillId = data.skillId;
	var index ;
	for(var i in pet.skill) {
		var skill = pet.skills[i];
		if(skill.id = skillId) {
			if(skill.level > 0) {
				return callback("pet have learned the kill");
			}
			index = i;
			break;
		}
	}
	var item = dataApi.petLearnSkill.findById(skillId);
	
	var changeItem  = player.packageEntity.remove(item);
	pet.kills[index].level = 1;
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pet: pet,
				changeItem: changeItem
			});
		});
	});
}*/
exports.gmAddUpgradeItem2 = function(data, player, callback) {
	var items = ["D10080101", "D10080102", "D10080103", "D10080104","D10080105","D10080106","D10080107","D10080108","D10080109","D10080110"];
	for(var i in items) {
		var item = {
			itemId: items[i],
			itemNum: 99,
			level: 1
		}
		player.packageEntity.addItemWithNoType(player, item);
	}
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err) {
			redis.release(client);
			callback(err, {});
		});
	});
}
exports.gmAddUpgradeItem = function(data, player, callback) {
	var pets = player.pets,  pet = player.pets.get(data.index);
	var petInfo = dataApi.pets.findById(pet.id); 
	console.log(petInfo);
	var skillLevel = data.skillLevel ||　pet.skillLevels[data.skillIndex];
	var petSkillInfo = dataApi.petsSkillsUpgrade.findById(petInfo["skill"+data.skillIndex]);
	console.log(petInfo["skill"+data.skillIndex]);
	var p = petSkillInfo["upgrade"+skillLevel];
	
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var changeItems = [];
	for(var i = 0 ;i < 3;i++){
		var item = p.items[i];
		var changeItem = player.packageEntity.addItemWithNoType(player, item);
		changeItems.push(changeItem);
	}
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	console.log(JSON.stringify(changeItems));
	//throw new Error("////");
	//setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err) {
			redis.release(client);
			callback(err, changeItems);
		});
	});
}
exports.upgradeSkill = function(data, player, callback) {
	var pets = player.pets,  pet = player.pets.get(data.index);
	if(!pet) {
		return callback("The absence of pets");
	}
	var petInfo = dataApi.pets.findById(pet.id); 
	var skillLevel = pet.skillLevels[data.skillIndex];
	var petSkillInfo = dataApi.petsSkillsUpgrade.findById(petInfo["skill"+data.skillIndex]);
	var p = petSkillInfo["upgrade"+skillLevel];
	if(!p) {
		return callback("level full");
	}
	if(pet.level < p.level) {
		return callback("pet level not enough");
	}
	if(player.money < p.money) {
		return callback("money not enough");
	}
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var items = (p.items);
	console.log(items);
	var checkResult = player.packageEntity.checkItems(items);
	console.log(checkResult);
	if(!checkResult || checkResult.length == 0) {
		return callback("item not enough");
	}
	var changeItems = player.packageEntity._removeItems(checkResult);
	if(!changeItems) {
		return callback("item remove error");
	}
	console.log(changeItems);
	pet.skillLevels[data.skillIndex] = ++skillLevel;
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	};
	player.money -= p.money;
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	setArray.push(["hset", data.Key, "money", player.money]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pet: pet,
				pets: pets.pets,
				changeItems: changeItems,
				money: player.money
			});
		});
	});
}
var randomItem = function(level) {
	var itemsInfo = dataApi.petsRandom.findById(level);
	var ran = Math.random() ;
	for(var i = 0,l = itemsInfo.items.length ; i < l ;i++) {
		if(itemsInfo.items[i].probability > ran){
			return {
				itemId: itemsInfo.items[i].itemId,
				itemNum : 1,
				level: 1
			}
		}
	}

}
exports.usePet = function(data, player, callback) {
	var pets = player.pets, pet = pets.get(data.index);
	if(!pet) {
		return callback("no pet");
	}
	var petInfo = dataApi.pets.findById(pet.id);
	var getName = false;
	if(pet.endTime > Date.now()){
		return callback("Skills have not cooled");
	}
	for(var i = 0 ; i < 3; i++) {
		if(pet.status[i] < 20) {
			return callback("status  not enough");
		}
	}
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var callResult = {};
	var skill0 = petInfo.skill0;
	var skill0Level = pet.skillLevels[0];
	console.log(skill0Level);
	var mail = {
		"from": "0",
		"fromName":"系统",
	    "to": player.playerId,
	    "title": "你宠物捡回来的东西",
	    "content": "来自你宠物的礼物！请收好",
	    "type": 2,
	    "toName": player.nickName
	};
	switch(skill0) {
		case "PK0101":
			var item = randomItem(skill0Level);
			console.log(item);
			var changeItem = player.packageEntity.addItemWithNoType(player, item);
			//callResult.changeItems = changeItem.index;
			var package = {
				itemCount :player.packageEntity.itemCount,
				items: player.packageEntity.items
			}
			//setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
			mail.items = [item];
		break;
		case "PK0102":
			var exp = Math.round((Math.random()*500 + 1000)*(pet.level || 1)*(skill0Level));
			player.experience += exp;
			//需要判断经验是否可以升级
			//setArray.push(["hset", data.Key, "experience", player.experience]);
			mail.experience = exp;
			//callResult.experience = player.experience;
		break;
		case "PK0103":
			var money = Math.round((Math.random()*1500 + 500)*(pet.level || 1)*(skill0Level));
			console.log(money);
			player.money += money;
			//setArray.push(["hset", data.Key, "money", player.money]);
			mail.money = money;
			//callResult.money = player.money;
		break;
		case "PK0104":
			var skill = {
				level: Math.round(Math.random()*4+1),
			}
			console.log(skill);
			if(Math.random()*100 < 40){
				var item = randomItem(skill0Level);
				var changeItem = player.packageEntity.addItemWithNoType(player, item);
				var package = {
					itemCount :player.packageEntity.itemCount,
					items: player.packageEntity.items
				}
				//setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
				mail.items = [item];
				//callResult.changeItems = changeItem.index; 
			}

			var exp = Math.round((Math.random()*500 + 1000)*(pet.level || 1)*(skill.level)*0.4);
			player.experience += exp;
			//需要判断经验是否可以升级
			//setArray.push(["hset", data.Key, "experience", player.experience]);
			//callResult.experience = player.experience;
			mail.experience = exp;

			var money = Math.round((Math.random()*1500 + 500)*(pet.level || 1)*(skill0Level)*0.4);
			player.money += money;
			//setArray.push(["hset", data.Key, "money", player.money]);
			//callResult.money = player.money;
			mail.money = money;
		break;
	}
	var skill1 = petInfo.skill1;
	var skill1Level = pet.skillLevels[1];
	if(skill1Level > 0){
		switch(skill1) {
			case "PK0201":
				if((Math.random()*100) < 40) {
					//神秘副本
				}
			break;
			case "PK0202":
				if((Math.random()*100) < 60) {
					//boss
				}
			break;
			case "PK0203":
				if((Math.random()*100) < 50) {
					//游魂
				}
			break;
			case "PK0204":
				if((Math.random()*100) < 50) {
					//特殊事件
				}
			break;
		}
	}
	
	var skill2 = petInfo.skill2;
	var skill2Level = pet.skillLevels[2];
	if(skill2Level > 0) {
		switch(skill2) {

		}
	}
	var minutes = 60 * 1000;
	pet.skillCDTime = minutes * (150 - pet.status[0]);
	pet.endTime = Date.now() + minutes * (150 - pet.status[0]);
	pet.exp += pet.status[2];
	
	//var upgradeExp =  upgradeInfo.M * pet.level + upgradeInfo.P;
	if(pet.exp >= pet.nextExp) {
		pet.level++;
		pet.exp -= pet.nextExp;
		var upgradeInfo = dataApi.petsUpgrade.findById(pet.id);
		pet.nextExp = upgradeInfo.M * pet.level+upgradeInfo.P;
	}
	for(var i = 0; i < 3; i++) {
		pet.status[i] -= 20;
	}
	callResult.pets = pets.update().pets;
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	console.log(callResult);
	mailDao.setTimeSendMail(mail,pet.skillCDTime);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
				redis.release(client);
				callback(err, callResult);
		});
	});
}

exports.gmAddFeedItem = function(data, player, callback) {
	var feedItems = ["D10080221","D10080222","D10080223"]
	var changeItems = player.packageEntity.addItemWithNoType(player,{
		itemId : feedItems[data.index],
		itemNum : 10,
		level: 1 
	});
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	};
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				changeItems: changeItems
			});
		});
	});
}

exports.feed = function(data, player, callback) {
	var itemInfo = dataApi.feedItem.findById(data.itemId);
	var pets = player.pets, pet = pets.get(data.index);
	if(!pet) {
		return callback("The absence of pet");
	}
	pets.update();
	pet.status[itemInfo.key] += itemInfo.value;pet.status[itemInfo.key] = (pet.status[itemInfo.key] > 100?100:pet.status[itemInfo.key]);
	console.log(player.packageEntity);
	var checkResult = player.packageEntity.hasItem({
		itemId : data.itemId,
		itemNum : 1
	});
	if(!checkResult) {
		return callback("no item");
	}
	var changeItems = [];
	for(var i in checkResult) {
		var item = checkResult[i];
		var _item = player.packageEntity.removeItem(item.index, 1);
		changeItems.push({
			index: item.index,
			item:_item
		}); 
	}
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];

	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	};
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets.db())]);
	console.log(changeItems);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pets:pets.pets,
				changeItems: changeItems
			});
		});
	});
}
