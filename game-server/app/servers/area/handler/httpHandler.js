/**
 * Created with JetBrains WebStorm.
 * User: qinjiao
 * Date: 13-8-21
 * Time: 下午5:52
 * To change this template use File | Settings | File Templates.
 */

var http = require('http');
var logger = require('pomelo-logger').getLogger(__filename);
var code = require('../../../../../shared/code');
var handler = module.exports;
handler.getHttp = function(msg, session, next) {
    var options = {
        host:msg.host,
        port:msg.port,
        path:msg.path
    }
    http.get(options,function(res) {
        var buffers = [],size=0;
        res.on('data',function(buffer) {
            buffers.push(buffer);
            size+=buffer.length;
        });
        res.on('end', function() {
            var buffer = new Buffer(size),pos = 0;
            for(var i = 0 ,l=buffers.length;i<l;i++) {
                buffers[i].copy(buffer, pos);
                pos += buffers[i].length;
            }
            next(null, {
                code:code.OK,
                result:buffers.toString()
            });
        });
    }).on('errer',function(e){
            logger.error(e.message);
            next(null,{
               code:code.FAIL,
               err: e.message,
               route:"area.httpHandler.getHttp"
            });
        });
}