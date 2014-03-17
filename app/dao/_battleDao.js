 var TL = require("../domain/tl").TL;
 var partnerUtil = require("../utils/partnerUtil");
var Fight =  require("../domain/fight");
var Battle = Fight.Battle;
var dataApi = require("../utils/dataApi");
exports.battleBasic = function(o1,o2) {

}
exports.battleMonster = function(msg) {
	var player = msg.player,
		Key = msg.Key,
		setArray = msg.setArray,
		mInfo = msg.mInfo;
	console.log(mInfo);
 	var tl = new TL(player.tl);
    tl.update();
 	if(tl.value < 5){
 		throw "体力不足";
 	}
    tl.value -= 5;
    setArray.push(["hset", Key, "tl", JSON.stringify(tl.db())]);
 	var jl = {money:0, exp: 0,items:[],bossItems:[]};
 	var ms =[];
    for(var i = 1; i <= 7; i++) {
        if(player.formation.formation[i] == null ) {
            ms.push(null);
        }else{
            var playerId = player.formation.formation[i].playerId;
            if(playerId == player.id) {
                ms.push(new Battle(Fight.again(player), i));
            }else{
                var character = partnerUtil.getPartner(playerId, player);
                ms.push(new Battle(Fight.again(character), i));
            }
            
        }
    }
    var ps = [];
    var gs = [];
	for(var i =0,len =  mInfo.formation.length; i < len; i++) {
		if(mInfo.formation[i]) {
			var info = dataApi.monster.findById(mInfo.formation[i]);
			gs.push(new Battle(info, i+1) );
            jl.money += (info.money - 0);
            jl.exp += (info.experience-0);
            if(info.monsterType == 0){
				jl.items = jl.items.concat(info.items);
            }else{
            	jl.bossItems = jl.bossItems.concat(info.items);
            }             
		}
	}
	var battleData = Fight.fight(ms,gs);
	var result = {};
	if(battleData.isWin) {
		result.win = true;
		if(jl.money > 0) {
			player.money += jl.money;
			setArray.push(["hset", Key, "money", player.money]);
			result.money = player.money;
		}
		if(jl.exp > 0) {
			player.experience += jl.exp - 0;
			setArray.push(["hset", Key, "experience", player.experience]);
			result.exp = player.experience;
		}
		if(jl.items.length > 0 || jl.bossItems.length > 0) {
			result.items = []; 
	        result.changeItems = [];
			var mailItem =[];
			for(var i =0,len = jl.items.length; i < len; i++) {
	            var itemInfo = jl.items[i].split("|");
				var item = {
	                itemId: itemInfo[0],
	                itemNum: itemInfo[1],
	                level: 1
	            };
				var changeItem = player.packageEntity.addItemWithNoType(player, item);
				if(changeItem != null) {
					item.itemNum = itemInfo[1];
	                result.items.push(item);
					result.changeItems.push(changeItem.index);
				}
			}
			for(var i = 0, len = jl.bossItems.length; i < len; i++ ) {
				var itemInfo = jl.bossItems[i].split("|");
	            var item = {
	                itemId: itemInfo[0],
	                itemNum: itemInfo[1],
	                level: 1
	            };
				var changeItem = player.packageEntity.addItemWithNoType(player, item); 
				if(changeItem != null) {
					item.itemNum = itemInfo[1];
	                result.items.push(item);
					result.changeItems.push(changeItem.index);
				}else{
					mailItem.push(item);
				}
			}
			var package = {
				itemCount :player.packageEntity.itemCount,
				items: player.packageEntity.items
			};
			setArray.push(["hset", Key, "package", JSON.stringify(package)]);
			if(mailItem.length > 0) {
				mailDao.setTimeSend({},1);
			}
		} 
		//刷新任务
		var tasks = player.tasks;
		var changeTasks = [];
		for(var i in tasks.undone) {
			var task = tasks.undone[i];
			if(task.type == "killMonster"){
				for(var g in gs) {
					var m = gs[g];
					if(m.id == task.taskProgress.monsterId){
						task.taskProgress.number++;
						if(task.taskProgress.requireNum <= task.taskProgress.number) {
							task.status = "completed";
						}
						changeTasks.push(task);
					}
				}
				
 			}
		}
		if(changeTasks.length > 0) {
			setArray.push(["hset", Key, "tasks", JSON.stringify(player.tasks)]);
			result.events={};
			result.events.task = changeTasks;
		}
		
	} else {
		result.win = false;
	}
	data =  battleData.battle;
	result.tl = tl.value;
	data.result = result;
	return data;
}