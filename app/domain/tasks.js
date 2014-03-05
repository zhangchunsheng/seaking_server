/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: tasks
 */

var Tasks = function(opts) {
    this.currentMainTask = opts.currentMainTask;
    this.currentBranchTask = opts.currentBranchTask;
    this.currentDayTask = opts.currentDayTask;
    this.currentExerciseTask = opts.currentExerciseTask;
};

/**
 * Expose 'Task' constructor
 */

module.exports = Tasks;

/**
 * initTask
 */
Tasks.prototype.initTask = function() {
    var date = new Date();
    this.currentMainTask = {"taskId": "Task10101", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()};
    this.currentBranchTask = {"taskId": "Task20201", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()};
    this.currentDayTask = [{"taskId": "Task30201","status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()}];
    this.currentExerciseTask = {"taskId": "Task40201", "status": 0, "taskRecord": {"itemNum": 0}, "startTime": date.getTime()};
};

/**
 * getInfo
 */
Tasks.prototype.getInfo = function() {
    return {
        currentMainTask: this.currentMainTask.getInfo(),
        currentBranchTask: this.currentBranchTask.getInfo(),
        currentDayTask: this.currentDayTask.getInfo(),
        currentExerciseTask: this.currentExerciseTask.getInfo()
    };
};

/**
 * strip
 */
Tasks.prototype.strip = function() {
    return {
        currentMainTask: this.currentMainTask,
        currentBranchTask: this.currentBranchTask,
        currentDayTask: this.currentDayTask,
        currentExerciseTask: this.currentExerciseTask
    };
};