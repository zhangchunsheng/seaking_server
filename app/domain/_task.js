var dataApi = require("../utils/dataApi");
var Types ={
	0: "dialogue", //对话
	1: "killMonster",//打怪
	2: "getItem", //给东西
	3: "duplicate" //副本
}
var Ps = {
	"killMonster": "monsterId",
	"getItem": "itemId",
	"duplicate": "duplicateId"
}

var taskTypes = {
	1:"main",
	 2:"branch",
	 3:"dailly",
	 4:"activity"
}
	/*unacceptable -> 不可接受
    acceptable -> 可接受
    doing -> 正在进行
    completed -> 已完成
    commited -> 已提供*/
var Statuss = {
	
}
function Task(opts) {
	
};
Task.init = function(info) {
	var task = {};
	task.taskId  = info.taskId;
	console.log(info.taskGoal);
	task.status = "acceptable";
	//task.type = info.eventType;
	/*if(info.taskGoal) {
		task.taskProgress = {};
		task.taskProgress.requireNum = info.eventNum;
		task.taskProgress.number = 0;
		task.taskProgress[Ps[info.eventType]] = info.taskGoal;
	}*/
	task.taskProgress = 0;
	return task;
};
Task.updateItem = function(task, package) {
	if(task.type != Types[2]) {
		return;
	}
	var info = dataApi.task.findById(task.taskId);
	var itemId = task.taskProgress.itemId;
	var num = package.findAll(itemId);
	task.taskProgress = num;
	if(task.taskProgress >= info.eventNum) {
		task.status = "completed";
	}else{
		task.status = "doing";
	}
}
Task.update = function(task, player) {
	var info = dataApi.task.findById(task.taskId);
	if(info.taskGoal.indexOf("H")>=0){
		console.log(player.soulPackage);
	}
}
var getNextDayTime = function() {
	console.log("now:", Date.now());
	var d = new Date();
	var date = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
	console.log(date.getTime());
	return date.getTime();
};
var Tasks = function(opts) {
	opts = (typeof opts == "string"? JSON.parse(opts) :opts);
	this.undone = opts.undone || [];
	this.dayDone = opts.dayDone || {data:[] ,time: getNextDayTime()};
	this.done = opts.done || [];
};
Tasks.Max = 4;
Tasks.prototype = {
	updateDu: function(duId) {
		var tasks = [];
		for(var i in this.undone) {
			var d = this.undone[i];
			var dInfo = dataApi.task.findById(d.taskId);
			if(dInfo.taskGoal == duId) {				
				d.taskProgress = 1;
				d.status = "completed";
				tasks.push(d);
			}
		}
		return tasks;
	},
	updateItem: function(itemId, package) {
		var tasks = [];
		var num = package.findAll(itemId);
		for(var i in this.undone) {
			var d = this.undone[i];
			var dInfo = dataApi.task.findById(d.taskId);
			console.log(dInfo);
			if(dInfo.taskGoal == itemId){
				tasks.push(d);
				d.taskProgress = num;
				if(dInfo.eventNum <= d.taskProgress) {
					d.status = "completed";
				}else{
					d.status = "doing";
				}
			}
			/*if(d.taskProgress&&d.taskProgress.itemId == itemId) {
				tasks.push(d);
			}*/
		}
		return tasks;
	},
	find: function(taskId) {
		for(var i in this.undone) {
			var d = this.undone[i];
			if(d.taskId == taskId){
				return i;
			}
		}
		return -1;
	},
	addDoneTask: function(info) {
		//console.log(info);
		if(info.type == taskTypes[1]){

		}else if(info.type == taskTypes[4]){
			this.dayDone.data.push(info.taskId);
		}else{
			this.done.push(info.taskId);
		}
		
	},
	isFull: function() {
		return this.undone.length == Tasks.Max; 
	},
	get: function(index) {
		return this.undone[index];
	},
	add: function(task,player) {
		var dInfo = dataApi.task.findById(task.taskId);
		if(dInfo.eventType != Types[0]) {
			if(!dInfo.taskGoal || dInfo.taskGoal.indexOf("H") >= 0 || dInfo.taskGoal == ""  ) {
				//task.taskProgress =player.soulPackageEntity.findAll(dInfo.taskGoal) ;
				/*if(task.taskProgress >= dInfo.eventNum) {
				//	task.status = "completed";
				}else{
					task.status = "doing";
				}*/
				task.taskProgress = 1;
				task.status = "completed";
			}else if(task.type == Types[2]){
				var itemId = task.taskProgress.itemId;
				var num = package.findAll(itemId);
				task.taskProgress = num;
				if(task.taskProgress >= dInfo.eventNum) {
					task.status = "completed";
				}else{
					task.status = "doing";
				}
			}else{
				task.status = "doing";
			}		
		} else {
			task.status = "completed";
			task.taskProgress =1;
		}
		this.undone.push(task);		
	},
	del: function(start) {
		var rest = this.undone.slice(( start)+1);
	    this.undone.length = start < 0 ? this.undone.length + start : start;
	    this.undone.push.apply(this.undone, rest);
	    return  this.undone;
	},
	update: function() {
		if( this.dayDone.time < Date.now() ) {
			this.dayDone.data = [];
			this.dayDone.time = getNextDayTime();
		}
	},
	strip: function(level) {
		var tasks = [];
		var canDo = Tasks.getCanDo(this, level);
		tasks = tasks.concat(canDo).concat(this.undone);
		return tasks;
	}	
}
var getMain = function(undone) {
	for(var i in undone) {
		if(undone[i].taskId.indexOf("Task1") >= 0 ){
			return undone[i];
		}
	}
}
Tasks.Can = function(taskInfo, tasks, level, main) {
	var undone = tasks.undone ,
	main = getMain(undone),
    done = tasks.done ,
    dayDone = tasks.dayDone ;
	main = main || getMain(tasks.undone);
	if(taskInfo.taskId.indexOf("Task1")== -1) {
        var over = false;
        for(var d in undone) {
            if(undone[d].taskId == taskInfo.taskId) {
                over = true;
            }
        }
        if(over){return;}
        for(var d in done){
            if(done[d] == taskInfo.taskId) {
                over = true;
            }
        }
        if(over){return;}
        for(var d in dayDone.data) {
            if(dayDone.data[d] == taskInfo.taskId) {
                over = true;
            }
        }
        if(over){return;}
        if(taskInfo.minLevel > level) {
            return;
        }
        if(taskInfo.prerequisites && taskInfo.prerequisites.indexOf("Task") >= 0) {
            
            if(taskInfo.prerequisites.indexOf("Task1") >= 0) {
            	console.log(main);
            	console.log(taskInfo.prerequisites);
                if(taskInfo.prerequisites < main.taskId){
                    return Task.init(taskInfo);
                }   
            }//其他任务依赖暂时没写
        }     //其他条件判断
        else {
            return Task.init(taskInfo);
        }
    }
}
Tasks.getCanDo = function(tasks, level) {
	var taskInfos = dataApi.task.data;
	var undone = tasks.undone ,
	main = getMain(undone),
    done = tasks.done ,
    dayDone = tasks.dayDone ,
	canDo = [];
    for(var i in taskInfos) {
        var taskInfo = taskInfos[i];
        var task = Tasks.Can(taskInfo, tasks,  level, main);
        if(task){
        	canDo.push(task);
        }
    }
    return canDo;
}
module.exports = {
	Tasks: Tasks,
	Task: Task
};