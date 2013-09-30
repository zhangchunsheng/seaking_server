/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-15
 * Time: 上午1:13
 * To change this template use File | Settings | File Templates.
 */
var consts = require('../consts/consts');
var packageDao = require('../dao/packageDao');
var Mail = function(opts){
    this.mailId = opts.mailId;

    this.from = opts.from || 0 ;

    this.to = opts.to;
    this.title = opts.title;
    this.time = new Date().getTime();
    this.content = opts.content;
    this.type = opts.type || consts.MailType.PLAYER;
    if('string' == typeof opts.items) {
        opts.items = JSON.parse(opts.items);
    }
    if( !!(opts.items) &&  opts.items.length > 0 ) {
        this.items = opts.items;
        for(var i in this.items){
            var item = this.items[i];
            packageDao.fullItem(item);
            item.hasCollect = 0;
        }
    }
    if( !!(opts.replyId) ) {
        this.replyId = opts.replyId ;
    }

    this.fromName = opts.fromName || "管理员";

    this.toName = opts.toName;
}
module.exports = Mail;