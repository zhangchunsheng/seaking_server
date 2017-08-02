var dataApi = require("../utils/dataApi");
var ghosts = require("../../config/data/ghosts");
var Battle = function(opts, index) {
	if(opts ==null){
		return null;
	}
	this.hp = opts.maxHp || opts.hp || 0;
	this.maxHp =  opts.maxHp || opts.hp || 0;
	this.defense = opts.defense;
	this.attack = opts.attack;
	this.sunderArmor = opts.sunderArmor || 0;
	this.speed = opts.speed;
	this.criticalHit = opts.criticalHit;
	this.block = opts.block;
	this.dodge = opts.dodge;
	this.counter = opts.counter;
	this.id  = opts.id || opts.playerId;
	this.time = 0;
	this.index = index;
}
var getList = function(list) {
	var result = [];
	for(var i =0; i< 7; i++) {
		if(!list[i]) {
			result.push(0);
		}else{
			var battle = list[i];
			var _battle = {};
			_battle.id = battle.id;
			_battle.maxHp =battle.maxHp;
			_battle.HP = battle.hp;
			result.push(_battle);
		}
	}	
	return result;
}
//开始战斗
var fight = function(a,b) {
	//var nowTime = 0;
	var data = {
		player: getList(a),
		enemy: getList(b)
	}
	var times = [];
	var l = 0;
	var battle = true;
	var bresult = -1;
	var max = 0;
	var sequence = [];
	//var last;
	while(battle) {
		var r = shot(a,b);
		r.battle.time = r.time;
		var bdata;//战斗结果
		var ba ;
		if(r.type == 0) {
			ba = findAttacked(b);	
			ba.type = 1;		
		}else{
			ba = findAttacked(a);	
			ba.type = 0;	
		}
		bdata = oneFight(r, ba);
		sequence.push(r.battle.id);
		//bdata.time = r.time;
		r.num++;
		if(r.num>max){max = r.num;if(max == 100){
			battle = false;
			bresult = 1;
		}};
		//last = bdata.data;
		times.push(bdata.data);
		if(bdata.isDead == true) {
			var alld = true;
			if(r.type == 1) {		
				for(var i in a) {
					if(a[i] && a[i].hp > 0){
						alld = false;
					}
				}
				if(alld){
					bresult = 0;
					battle = false;
				}
			} else {
				for(var i in b){
					if(b[i] && b[i].hp > 0) {
						alld = false;
					}
				}
				if(alld) {
					bresult = 1;
					battle = false;
				}
			}
		}
	}
	//times.push(last);
	data.battle = times;
	data.sequence = sequence;
	/*return {
		battle:data,
		isWin: bresult
	};*/
	return {
		battle: data, 
		isWin: true
	}

}
//战斗
var oneFight  = function (r1, r2) {
	var o1 = r1.battle;
	var o2 = r2.battle;
	/*var data = {
		attacker: {
			id: o1.id,
			index: r1.index,
			type: r1.type
		},
		attacked: {
			id: o2.id,
			index: r2.index,
			type: r2.type
		}
	};*/
	var data = {};
	//data.sequence = [o1.id];
	data.camp = (r1.type == 0?"player":"enemy");
	data.attacker = o1.index;
	data.target = o2.index;
	//是否技能判断
	if(false) {
		data.attackType = 1
	}else{
		//闪避判断
		if(false){//Math.Random() <= o2.dodge / 1000) {

		}else {
			var sh = Math.round( (o1.attack * o2.maxHp) /(o2.maxHp + o2.defense ));
				
			data.attackType = 0;
			if(false){//暴击
				data.damageType = 1;
				sh *= 1.6;
			}else{
				data.damageType = 0;
			}

			if(false) { //格挡  先算暴击还是先算格挡的这就不知道了
				data.targetAction = 1;//"block"->1
				sho *= 0.6;
			}else{
				data.targetAction = 0;// "hit" ->0
			}
			data.targetHP = -sh;
			o2.hp -= sh;
			if(o2.hp < 0){ o2.hp = 0; data.targetDie = 1; return {data:data , isDead: true}; }
			data.targetDie = 0;
			//是否有吸血的被动
		}
		//反击判断
		if(false){//o2.counter) {
			var sh = Math.round( (o2.attack * o1.maxHp) /(o1.maxHp + o1.defense ));
			/*data.back = {
				hurt: sh,
				hp: o1.hp
			}*/
		}else{
			data.back = 0;
			//attackerDie
		}
	}
	return {
		data: data,
		isDead: false
	};
}
//判断速度
var shot = function(a,b) {
	var m = {
		time: 9999999,
		battle: {},
		type :0,
		index: -1
	};
	for(var i = 0, len = a.length; i < len; i++) {
		var ba = a[i];
		if(ba && ba.hp > 0) {

			var t  = ba.time + 100/ ba.speed;
			if( t < m.time ) {
				m.time = t;
				m.battle = ba;
				m.type = 0;
				(function(i){
					m.index = i;
				})(i);
			}
		}
		
	}
	for(var i = 0, len = b.length; i < len; i++ ) {
		var ba = b[i];
		if(ba &&  ba.hp > 0) {
			var t  = ba.time +100/ ba.speed;
			if( t < m.time ) {
				m.time = t;
				m.battle = ba;
				m.type = 1;
				(function(i){
					m.index = i;
				})(i);
			}
		}
		
	}
	return m ;
}
//判断攻击人物
var findAttacked = function(list) {
	for(var i in list) {
		if(list[i] && list[i].hp > 0){		
			return {
				index: i,
				battle: list[i]
			};
		}
	}
}



/////////////////////////////////////////
var  getGhost = function(cId, level) {
	
	var hIds= cId.split("");
	hIds[2] = 0;
	cId = hIds.join("");
	var values = ghosts[cId];
	var datas = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
	for(var i =0; i<level; i++) {
		var value = values[i];
		datas[value.attrId] += value.attrValue;
	}
	return datas;
}
var getAptitudes = function(cId, aptitudes) {
	var hIds= cId.split("");
	hIds[2] = 0;
	cId = hIds.join("");
	var info = dataApi.aptitudes.findById(cId);
	var datas = {};
	var types = {
		1 : "hp" ,
	 	2 : "attack" ,
	 	3 : "defense",
	 	4 : "sunderArmor"  ,
	 	5 : "speed",
	 	6 : "criticalHit",
	 	7 : "block",
	 	8 : "dodge",
	 	9 : "counter"
	 };
	for(var i in info.aptitudes) {
		datas[info.aptitudes[i]] = (aptitudes[info.aptitudes[i]].level - 0)/50 * (info[types[info.aptitudes[i]]] - 0)
	}
	//console.log(datas);
	return datas;
}
var again = function(player, pet) {
	var cId = player.cId;
	var hero = dataApi.herosV2.findById(cId);
	var result = {};
	result.maxHp = hero.hp + hero.addHp * player.level;
	result.defense = hero.defense + hero.addDefense * player.level ;
	result.attack = hero.attack + hero.addAttack * player.level ;
	result.sunderArmor = hero.sunderArmor + hero.addSunderArmor * player.level;
	result.speed = (hero.speed || 0) + (hero.addSpeed || 0) * player.level ;
	result.criticalHit = (hero.criticalHit || 0) + (hero.addCriticalHit || 0)* player.level;
	result.block = (hero.block || 0) + (hero.addBlockHit || 0) * player.level;
	result.dodge = (hero.dodge || 0) + (hero.addDodge || 0) * player.level;
	result.counter = (hero.counter || 0)+ (hero.addDodge || 0) * player.level;
	//console.log(result);
	var types = {
		1 : "maxHp" ,
	 	2 : "attack" ,
	 	3 : "defense",
	 	4 : "sunderArmor"  ,
	 	5 : "speed",
	 	6 : "criticalHit",
	 	7 : "block",
	 	8 : "dodge",
	 	9 : "counter"
	 };
	//console.log(player.equipments);
	for(var i in player.equipments) {
		var equ = player.equipments[i];
		if(equ.epid) {
			//强化和打造
			var equInfo = dataApi.equipments.findById(equ.epid);
			//console.log("info:",equInfo);
			//console.log("equ:", equ);
			/*console.log(equInfo.attrValue + equInfo.attrAddValue * equInfo.attrAddForgeValue);
			console.log(types[equInfo.attrId]);*/
			result[types[equInfo.attrId]] += equInfo.attrValue + equ.level * (equInfo.attrAddValue + equInfo.attrAddForgeValue *equ.forgeLevel); 
			//console.log(equInfo.attrValue + equInfo.attrAddValue * equInfo.attrAddForgeValue);
			
			//宝石
			var diamonds = equ.inlay.diamonds;
			for(var d in diamonds) {
				if(diamonds[d]) {
					var dismond = dataApi.diamonds.findById(diamonds[d]);
					result[types[dismond.attrId]] += dismond.attrValue;
				}
			}
		} 
	}
	//console.log("addeq:",result);
		var pros = getGhost(cId, player.ghost.level);
		for(var g in pros) {
			result[types[g]] += pros[g];
		}
	//console.log("addghost", result);
		//console.log(player.aptitude);
		var aptPros = getAptitudes(cId, player.aptitude);
		for(var a in aptPros) {
			result[types[a]] += aptPros[a];
		}
	//console.log("addAptitudes:",result);
	for(var i in player.ZX.i) {
		var item = player.ZX.i[i];
		if(item) {
			var astrologyInfo = dataApi.astrology.findById(item.id) ;
			result[types[astrologyInfo.property]]  += astrologyInfo.value * item.level;
		}
	}
	//console.log("addZX:",result);
	if(player.pet) {
		var petInfo = dataApi.pets.findById(player.pet.id);
		console.log(petInfo);
	}
	
	//console.log("addpet:",result);
	result.id = player.id;
	return result;
}

//////////////////////////////////
exports.again = again;
exports.fight = fight;
exports.Battle = Battle;

/*1 - 生命 hp
 2 - 攻击 attack
 3 - 防御 defense
 4 - 幸运  sunderArmor
 5 - 速度 speed
 6 - 暴击 criticalHit
 7 - 格挡 block
 8 - 闪避 dodge
 9 - 反击 counter
 */
/*
	maxHp: 9580,
	defense: 194,
	attack: 1550,
	sunderArmor: 0,
	speed: 3.125,
	criticalHit: 6.3,
	block: 4.05,
	dodge: 4.05,
	counter	: 6.3
*/