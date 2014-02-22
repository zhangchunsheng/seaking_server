var dataApi = require("../utils/dataApi");
var Pets = function(opts) {
	opts = opts? JSON.parse(opts):[]  ;
	this.pets = [];
	for(var i = 0, len = opts.length; i < len;i ++) {
		this.pets.push(new Pet(opts[i]));
	}
}
Pets.prototype.strip = function() {
	return this.pets;
}
Pets.prototype.finePlayerId = function(playerId) {
	var _pet ;
	for(var i = 0, len = this.pets.length ;i < len; i++) {
		var pet = this.pets[i];
		if(pet.playerId == playerId) {
			_pet = pet;
		}
	}	
	return _pet;
}
Pets.prototype.remove = function(index) {
	var pets = this.pets;
	this.pets = pets.slice(0, index).concat(pets.slice((index-0)+1, pets.length));
	return this;
}
Pets.prototype.push = function(pet) {
	this.pets.push(new Pet(pet));
}
Pets.prototype.get = function(index) {
	return this.pets[index];
}
Pets.prototype.update = function() {
	var time = Date.now();
	var _self = this;
	for(var i = 0, len = _self.pets.length; i< len ;i++) {
		_self.pets[i].update(time);
	}
	return _self;
}
Pets.prototype.db = function() {
	var dbs = [];
	var _self = this;
	for(var i = 0, len = _self.pets.length; i< len; i++) {
		dbs.push(_self.pets[i].db());
	}	
	return dbs;
}
var Pet = function(opts) {
	this.level = opts.level;
	this.status = opts.status;
	this.skillLevels = opts.skillLevels;
	this.name = opts.name;
	this.id = opts.id;
	this.type = opts.type;
	this.exp = opts.exp;
	this.updateTime  =opts.updateTime;
	this.endTime = opts.endTime;
	this.playerId = opts.playerId;
	var upgradeInfo = dataApi.petsUpgrade.findById(this.id);
	this.nextExp = upgradeInfo.M * this.level+upgradeInfo.P;
	this.skillCDTime = opts.skillCDTime || 1;
}
Pet.prototype.update = function(t) {
	var pet = this;
    var house = 1000*60*60;
    var houses = Math.floor((t - pet.updateTime  )/house);
    pet.status[0] += houses*5;pet.status[0] = (pet.status[0] > 100?100:pet.status[0]);
    pet.status[1] += houses*2;pet.status[1] = (pet.status[1] > 100?100:pet.status[1]);
    pet.status[2] += houses*3;pet.status[2] = (pet.status[2] > 100?100:pet.status[2]);
    pet.updateTime += houses*house;
    pet.statusCD = (pet.updateTime+ 1000*60*60 - t);
    pet.skillCD = (pet.endTime - t);
    pet.skillCD = pet.skillCD < 0 ? 0 : pet.skillCD;
	pet.recover = [5,2,3];
	pet.mood = Math.floor((pet.status[0]+pet.status[1]+pet.status[2])/300/0.25);
	var properties = dataApi.pets.findById(pet.id);
	pet.combat  = Math.floor ( properties.hp * (1+ (properties.dodge/5) +(properties.block/8) ) + properties.attack * (5+properties.criticalHit +properties.counter)+properties.defense+2.5*properties.sunderArmor+properties.speed );
	console.log(pet.skillCD);
	console.log(pet.skillCDTime);
	pet.complete = 1-(pet.skillCD/pet.skillCDTime);
}
Pet.prototype.db = function() {
	var db = {};
	db.level = this.level;
	db.status = this.status;
	db.skillLevels = this.skillLevels;
	db.name = this.name;
	db.id = this.id;
	db.type = this.type;
	db.exp = this.exp;
	db.updateTime  =this.updateTime;
	db.endTime = this.endTime;
	db.playerId = this.playerId;
	db.skillCDTime = this.skillCDTime; 
	return db;
}
exports.Pets = Pets;