var status = {

}
exports.startTask = function(req, res) {
    var msg = req.query;
    var session = req.session;
    Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;
    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var taskId = msg.taskId || taskId;
    var taskInfo = dataApi.task.findById(taskId);
    if(!taskInfo) {
        return utils.send(msg, res, {
            code: Code.FAIL,
            err: "没有该任务"
        });
    }
    if(taskInfo.type == "main") {
        return utils.send(msg, res, {
            code: Code.FAIL,
            err: "主线不能领取"
        });
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var tasks = player.tasks;
        if(tasks.isFull()){
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "任务已经满了"
            });
        }
        var index = tasks.find(taskId);
        if(index != -1){
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "已经领过了"
            });
        }

        //检验领取条件
        
        //var task = Task.init(taskInfo);
        var task = Tasks.Can(taskInfo, tasks, player.level);
        if(!task) {
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "不能接"
            })
        };
        var setArray = [
            ["select", redisConfig.database.SEAKING_REDIS_DB]
        ];
        tasks.add(task);
        //Task.updateItem(task,player.packageEntity);
        setArray.push(["hset", Key, "tasks", JSON.stringify(tasks)]);
        console.log(setArray);
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err){
                    return utils.send(msg, res, {
                        code: Code.FAIL,
                        err: err
                    });
                } else {
                    utils.send(msg, res, {
                        code: Code.OK,
                        data: task
                    });
                }
            });
        });

    });
}
exports.endTask = function(req, res) {
    var msg = req.query;
    var session = req.session;
    Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var taskId = msg.taskId ;
    var taskInfo = dataApi.task.findById(taskId);
    if(!taskInfo) {
        return utils.send(msg, res, {
            code: Code.FAIL,
            err: "没有该任务"
        });
    }
    console.log("taskInfo:", taskInfo);
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var taskInfo = dataApi.task.findById(taskId);
        var taskIndex = player.tasks.find(taskId);
        var task = player.tasks.get(taskIndex);
        if(!task) {
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "没这任务"
            })
        }
        if(task.status != "completed"){
            return utils.send(msg, res ,{
                code: Code.FAIL,
                err: "没有达到完成条件"
            });
        }
        console.log("taskInfo:", taskInfo);
        if(task.taskProgress && task.taskProgress < taskInfo.eventNum) {
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "其他程序有漏洞"
            });
        }
        /*if(task.taskProgress && task.taskProgress.requireNum > task.taskProgress.number) {
            return utils.send(msg, res, {
                code: Code.FAIL,
                err: "其他程序有漏洞"
            });
        }*/
        var changeItems = [],
        changeTasks = [];
        if(task.type == "getItem") {
            //提交升级了开孔的装备怎么办
            var hasItems = player.packageEntity.hasItem({
                itemId: taskInfo.taskGoal ,
                itemNum: task.taskProgress,
                level:1
            });
            if(!hasItems){
                return utils.send(msg, res, {
                    code: Code.FAIL,
                    err: "其他程序有漏洞  物品不足"
                });
            }
            var removeResult = player.packageEntity.__removeItems([hasItems]);
            changeItems = removeResult;
            if(changeItems.length == 0 || !changeItems) {
                return utils.send(msg, res, {
                    code: Code.FAIL,
                    err: "程序错误"
                });
            }
            changeTasks = removeResult.tasks;
        }
        var setArray = [
            ["select", redisConfig.database.SEAKING_REDIS_DB]
        ];
        task.status = "commited";
        var taskInfo = dataApi.task.findById(taskId);
        var nextTaskId =  taskInfo.nextTaskId;
        player.tasks.del(taskIndex);
        if(nextTaskId) {
            var nextTaskInfo = dataApi.task.findById(nextTaskId);
            var nextTask = Task.init(nextTaskInfo);
            task.nextTask = nextTask;
            player.tasks.add(nextTask,player);
            //Task.updateItem(nextTask,player.packageEntity);
        }
        if(taskInfo.showNpcId) {
            task.showNpcId = taskInfo.showNpcId;
        }
        if(taskInfo.hideNpcId) {
            task.hideNpcId = taskInfo.hideNpcId;
        }
        
        player.addExp(taskInfo.getExp, Key, setArray, task);
        player.addMoney(taskInfo.getMoney, Key, setArray, task);
        if(taskInfo.rewardItems != "") {
            var itemInfo = taskInfo.rewardItems.split("|");
            var changeItems = [],changeTasks = [];
            for(var i = 0, len = itemInfo.length; i< len; i += 2) {
                var change = player.packageEntity.addItemWithNoType(player, {
                    itemId: itemInfo[i],
                    itemNum: itemInfo[i+1],
                    level: 1
                });
                changeItems.push(change.index);
                changeTasks =  changeTasks.concat(change.changeTasks);
                //刷新任务
            }
            
        }
        if( changeItems.length > 0 ) {
            var package = {
                itemCount :player.packageEntity.itemCount,
                items: player.packageEntity.items
            };
            setArray.push(["hset", Key, "package", JSON.stringify(package)]);
            task.changeItems = changeItems;
        }
        player.tasks.update();
        player.tasks.addDoneTask(taskInfo);
        data.changeTasks = changeTasks;
        setArray.push(["hset", Key, "tasks", JSON.stringify(player.tasks)]);
        console.log(setArray);
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err) {
                    utils.send(msg, res, {
                        code: Code.OK,
                        err:err
                    });
                } else {
                    utils.send(msg, res, {
                        code: Code.OK,
                        data: task,
                        tasks : player.tasks.strip()
                    });
                }
                
            });
        });
        
    });
}
var dataApi = require("../app/utils/dataApi");
var utils = require("../app/utils/utils");
var userService = require("../app/services/userService");
var Task = require("../app/domain/_task").Task;
var Tasks = require("../app/domain/_task").Tasks;
var Code = require("../shared/code");
var redis =  require('../app/dao/redis/redis')
 , redisConfig = require('../shared/config/redis');
 var TL = require("../app/domain/tl").TL;
 var env = process.env.NODE_ENV || 'development';
 var battleDao = require("../app/dao/_battleDao");
if(redisConfig[env]) {
    redisConfig = redisConfig[env];
}
exports.gmGetTask = function(req, res) {
    var msg = req.query;
    var taskInfos = dataApi.task.data;
     var session = req.session;
    var Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var taskId = msg.taskId || taskId;
    
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.tasks = player.tasks || {};
        player.tasks.undone = player.tasks.undone || [];
        player.tasks.done = player.tasks.done || [];
        player.tasks.dayDone = player.tasks.dayDone || {data:[], time:Date.now()};
        //var canDo = Tasks.getCanDo(player.tasks, player.level);
        utils.send(msg, res, {
            code: Code.OK,
            data: player.tasks
        });
    });
    
   /* utils.send(msg ,res, {
        data: task
    });*/
}

exports.gmCleanTask = function(req, res) {

}
exports.gmAddTask = function(req, res) {
    var msg = req.query;
    var taskInfos = dataApi.task.data;
     var session = req.session;
    var Key = utils.getDbKey(session);
    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);
    var taskId = msg.taskId || taskId;
    var setArray = [
        ["select", redisConfig.database.SEAKING_REDIS_DB]
    ];
    var taskId = msg.taskId || "Task10101";
    var taskInfo = dataApi.task.findById(taskId);
    var tasks = new Tasks({
        /*undone:[{taskId:"Task10101", status:"completed", type: "duplicate", taskProgress :{
            requireNum : 1,
            number: 1,
            duplicateId:  "Ins10101"
        }}]*/
    });
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        
    tasks.add(Task.init(taskInfo),player);
    setArray.push(["hset", Key, "tasks", JSON.stringify(tasks)]);
    
    
        redis.command(function(client) {
            client.multi(setArray).exec(function(err, result) {
                redis.release(client);
                if(err){
                    utils.send(msg, res, {
                        code: Code.FAIL,
                        err: err
                    });
                }else{
                    utils.send(msg, res, {
                        code: Code.OK
                    }); 
                }
            });
        });
    });
}