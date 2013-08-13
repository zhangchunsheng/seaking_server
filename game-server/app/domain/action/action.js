/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: action
 */
var id = 1;

/**
 * Action class, used to excute the action in server
 */
var Action = function(opts){
    this.data = opts.data;
    this.id = opts.id || id++;
    this.type = opts.type || 'defaultAction';

    this.finished = false;
    this.aborted = false;
    this.singleton = false || opts.singleton;
};

/**
 * Update interface, default update will do nothing, every tick the update will be invoked
 * @api public
 */
Action.prototype.update = function(){
};

module.exports = Action;
