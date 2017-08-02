var event = function() {

}
var Types ={
	getItem: 1,
	getMoney: 6,
	getExp :5
}
var Tasks = require("./_task").Tasks;
var utils = require("../utils/utils");
event.do = function(eInfo, player, Key, setArray, data) {
	console.log("eInfo:",eInfo);
	switch(eInfo.reward.type) {
		case Types.getItem:
			var item = utils.clone(eInfo.reward.item);
			var changeItem = player.packageEntity.addItemWithNoType(player, item).index;
			if(!changeItem) {
				throw {
					code: Code.FAIL,
					err: "背包满了"
				};
			}
			var package = {
                itemCount :player.packageEntity.itemCount,
                items: player.packageEntity.items
            };
            player.tasks.updateItem(item.itemId, player.packageEntity);
            var tasks = player.tasks.updateItem(item.itemId, player.packageEntity);
            console.log("tasks:",tasks);
            if(tasks && tasks.length > 0 ){
            	setArray.push(["hset", Key, "tasks", JSON.stringify(player.tasks)]);
            	data.changeTasks = tasks;
            }
            setArray.push(["hset", Key, "package", JSON.stringify(package)]);
			data.changeItem = changeItem;
		break;
		case Types.getMoney:
			console.log(data);
			player.addMoney(eInfo.reward.data,Key,setArray, data);
		break;
		case Types.getExp:
			player.addExp(eInfo.reward.data, Key, setArray, data);
		break;
	}
}
module.exports = event;