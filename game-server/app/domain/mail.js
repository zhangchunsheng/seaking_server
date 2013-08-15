/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-15
 * Time: 上午1:13
 * To change this template use File | Settings | File Templates.
 */

var Mail = function(opts){
    this.playerId = opts.playerId;
    this.id = opts.mailId;
    this.from = opts.from;
    this.to = opts.to;
    this.title = opts.title;
    this.time = opts.time;
    this.content = opts.content;
    this.type = opts.type;
    this.item=opts.item||[];
}