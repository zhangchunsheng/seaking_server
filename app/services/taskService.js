/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: arenaService
 */
var taskDao = require('../dao/taskDao');

var taskService = module.exports;

taskService.startTask = function() {

}

taskService.handOverTask = function() {

}

taskService.updateTask = function(player, tasks, cb) {
    taskDao.updateTask(player, tasks, cb);
}

taskService.getUpdateArray = function() {

}

taskService.update = function(player, tasks, cb) {
    taskDao.updateTask(player, tasks, cb);
}