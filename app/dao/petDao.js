var dataApi = require("../utils/dataApi");
var redis = require('../dao/redis/redis')
    , redisConfig = require('../../shared/config/redis');

var env = process.env.NODE_ENV || 'development';
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}


var update = function(pets) {
	var t = Date.now();
	var house = 1000*60*60;
	for(var i in pets) {
		var pet = pets[i];
		var houses = Math.floor((t - pet.updateTime  )/house);
		pet.status[0] += houses*5;pet.status[0] = (pet.status[0] > 100?100:pet.status[0]);
		pet.status[1] += houses*2;pet.status[1] = (pet.status[1] > 100?100:pet.status[1]);
		pet.status[2] += houses*3;pet.status[2] = (pet.status[2] > 100?100:pet.status[2]);
		pet.updateTime += houses*house;
	}
	return pets;
}
exports.update = function(data, player, callback) {
	var pets = update(player.pets);
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {pets: pets});
		});
	});
}
exports.gmUpgrade = function(data, player, callback) {	
	var pets = player.pets,
		pet = pets[data.index],
		upgradLevel = (data.uLevel-0) || 5;
		console.log(player.pets);
	if(!pet) {
		return callback("The absence of pets");
	}
	pet.level+=upgradLevel;
	var setArray =[
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err) {
			redis.release(client);
			callback(err, pet);
		});
	});
}
exports.gmAddUpgradeItem = function(data, player, callback) {
	var pets = player.pets,  pet = player.pets[data.index];
	var skill = pet.skills[data.skill];
	var petInfo = dataApi.petsUpgrade.findById(skill.skillId);
	console.log("petInfo:",petInfo);
	console.log("petLevel:", skill.level);
	var p = petInfo["P"+skill.level];
	
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var changeItems = [];
	for(var i = 0 ;i < 3;i++){
		var item = p["I"+i];
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
exports.gmAdd = function(data, player, callback) {
	var pets  = player.pets;
	var petInfo = dataApi.pets.findById(data.id);
	var skills = [];
	skills.push({skillId:petInfo["J0"], level:1});
	for(var i = 1; i <6;i++) {
		skills.push({skillId:petInfo["J"+i], level:0});
	}
	var pet = {
		level : 0,
		status : [100,100,100],
		skills: skills,
		name : petInfo.name,
		id : data.id,
		type : petInfo.type,
		exp : 0,
		updateTime: Date.now(),
		endTime: Date.now()
	}
	pets.push(pet);
	console.log(JSON.stringify(pets));
	var setArray =[
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err) {
			redis.release(client);
			callback(err, pets);
		});
	});
}

exports.setName = function(data, player, callback) {
	var pets = player.pets,
		pet = pets[data.index];
	if(!pet) {
		return callback("The absence of pets");
	}
	pet.name  = data.name;
	update(pets);
	var setArray =[
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {pets: pets});
		});
	});
}

exports.release = function(data, player, callback) {
	var pets = player.pets,
		pet = pets[data.index];
	if(!pet) {
		return callback("The absence of pets");
	}
	if(data.index < 0 || data.index > pets.length) {
		return callback("data is error!");
	}
	var _pet = pets.slice(0, data.index).concat(pets.slice((data.index-0)+1, pets.length));
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	var petInfo = dataApi.pets.findById(pet.id);
	player.money +=(petInfo.rM);
	var changeItems = [];
	var tasks = [];
	for(var i = 0 ; i <2 ; i++) {
		if(petInfo["rI"+i] !== "" ) {
			var splitResult = petInfo["rI"+i].split("|");
			var item = {
				itemId : splitResult[0],
				itemNum: (splitResult[1]-0) || 1,
				level: 1
			}
			var changeItem = player.packageEntity.addItemWithNoType(player, item);
			changeItems.push(changeItem.index);
			tasks.push(changeItems.task);
		}
	}
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	setArray.push(["hset", data.Key, "pets", JSON.stringify(_pet)]);
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pet: pet,
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
		pet = pets[data.index];
	if(!hasPlayer(data.playerId, player)) {
		return callback("no have the player");
	}
	if(!pet) {
		return callback("The absence of pets");
	}
	if(pet.playerId == data.playerId){
		return callback(null, pet);
	}
	var _pet;
	for(var i in pets) {
		if(pets[i].playerId == data.playerId) {
			pets[i].playerId = undefined;
			_pet = pets[i];
		}
	}
	pet.playerId = data.playerId;
	update(pets);
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pets: pets
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
exports.upgradeSkill = function(data, player, callback) {
	var pets = player.pets,  pet = player.pets[data.index];
	var skill = pet.skills[data.skillIndex];
	var petInfo = dataApi.petsSkillsUpgrade.findById(skill.skillId);
	var p = petInfo["P"+skill.level];
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
	var changeItems = [];
	console.log(items);
	var checkResult = player.packageEntity.checkItems(items);
	if(!checkResult) {
		return callback("item not enough");
	}
	var changeItems = player.packageEntity.removeItems(checkResult);
	console.log(changeItems);
	skill.level++;
	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	}
	player.money -= p.money;
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	setArray.push(["hset", data.Key, "money", player.money]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pet: pet,
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
	var pets = player.pets, pet = pets[data.index];
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
	var skill0 = pet.skills[0];
	switch(skill0.skillId) {
		case "PK0101":
			var item = randomItem(skill0.level);
			console.log(item);
			var changeItem = player.packageEntity.addItemWithNoType(player, item);
			callResult.changeItem = changeItem;
			var package = {
				itemCount :player.packageEntity.itemCount,
				items: player.packageEntity.items
			}
			setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
		break;
		case "PK0102":
			var exp = Math.round((Math.random()*500 + 1000)*(pet.level || 1)*(skill0.level));
			player.experience += exp;
			//需要判断经验是否可以升级
			setArray.push(["hset", data.Key, "experience", player.experience]);
			callResult.experience = player.experience;
		break;
		case "PK0103":
			var money = Math.round((Math.random()*1500 + 500)*(pet.level || 1)*(skill0.level));
			console.log(money);
			player.money += money;
			setArray.push(["hset", data.Key, "money", player.money]);
			callResult.money = player.money;
		break;
		case "PK0104":
			getName = true;
			var skill = {
				level: Math.round(Math.random()*4+1),
			}
			if(Math.random()*100 < 40){
				var item = randomItem(skill.level);
				var changeItem = player.packageEntity.addItemWithNoType(player, item);
				var package = {
					itemCount :player.packageEntity.itemCount,
					items: player.packageEntity.items
				}
				setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
				callResult.changeItem = changeItem; 
			}

			var exp = Math.round((Math.random()*500 + 1000)*(pet.level || 1)*(skill.level)*0.4);
			player.experience += exp;
			//需要判断经验是否可以升级
			setArray.push(["hset", data.Key, "experience", player.experience]);
			callResult.experience = player.experience;

			var money = Math.round((Math.random()*1500 + 500)*(pet.level || 1)*(skill.level)*0.4);
			player.money += money;
			setArray.push(["hset", data.Key, "money", player.money]);
			callResult.money = player.money;
		break;
	}
	var skill1 = pet.skills[1];
	if(skill1.level > 0){
		switch(skill1.skillId) {
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
	
	var skill2 = pet.skills[2];
	if(skill2.level > 0) {
		switch(skill2.skillId) {

		}
	}
	var minutes = 60 * 1000;
	pet.endTime = Date.now() + minutes * (150 - pet.status[0]);
	pet.exp += pet.status[2];
	var upgradeInfo = dataApi.petsUpgrade.findById(pet.id);
	var upgradeExp =  upgradeInfo.M * pet.level + upgradeInfo.P;
	if(pet.exp >= upgradeExp) {
		pet.level++;
		pet.exp -= upgradeExp;
	}
	for(var i = 0; i < 3; i++) {
		pet.status[i] -= 20;
	}
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	callResult.pets = pets;
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			if(!getName){
				redis.release(client);
				callback(err, callResult);
			}else{
				var getArray = [
					["select", redisConfig.database.SEAKING_REDIS_DB],
					["keys", "S*_N*"]
				]
				client.multi(getArray).exec(function(err, r) {
					var names = r[1];
					var len = names.length;
					var n = names[Math.round (Math.random()*len)];
					var index = n.indexOf("_N");
					var name = n.substring(index+2);
					callResult.name = name;
					callback(err, callResult);
				});
			}
			
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
	var pets = player.pets, pet = pets[data.index];
	update(pets);
	pet.status[itemInfo.key] += itemInfo.value;pet.status[itemInfo.key] = (pet.status[itemInfo.key] > 100?100:pet.status[itemInfo.key]);
	console.log(player.packageEntity);
	var checkResult = player.packageEntity.hasItem({
		itemId : data.itemId,
		itemNum : 1
	});
	if(!checkResult) {
		return callback("no item");
	}
	var changeItem = {};
	for(var i in checkResult) {
		var item = checkResult[i];
		var _item = player.packageEntity.removeItem(item.index, 1);
		changeItem[item.index] = _item;
	}
	var setArray = [
		["select", redisConfig.database.SEAKING_REDIS_DB]
	];

	var package = {
		itemCount :player.packageEntity.itemCount,
		items: player.packageEntity.items
	};
	setArray.push(["hset", data.Key, "package", JSON.stringify(package)]);
	setArray.push(["hset", data.Key, "pets", JSON.stringify(pets)]);
	redis.command(function(client) {
		client.multi(setArray).exec(function(err, result) {
			redis.release(client);
			callback(err, {
				pets:pets,
				changeItem: changeItem
			});
		});
	});
}
