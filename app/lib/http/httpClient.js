/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-05
 * Description: httpClient
 */
var httpClient = module.exports;

/**
 *
 * @param type get|post
 * @param header
 * @param params
 * @param post_body
 */
var url = require('url');
httpClient.request = function(type, header, params, post_body,callback) {
    if(typeof params == 'string' && params.indexOf('http') == -1) {
        params = 'http://' + params;
    }
    var content = null;
    header = header || {};
    if(post_body) {
        content = require('querystring').stringify(post_body);
        header['Content-length'] = content.length;
    }

    var parse_url = url.parse(params,true);
    var htype = parse_url.protocol.slice(0,-1) || 'http';
    console.log(parse_url);
    var options = {
        hostname:parse_url.hostname || 'localhost'
        ,port:parse_url.port
        ,path:parse_url.path
        ,headers:header
        ,method: type.toUpperCase()
    }
    var req = require(htype).get(options,function(res) {
        var _data = '';
        res.on('data',function(chunk){
            _data +=  chunk;
        })
        res.on('end',function() {
            callback(null,_data);
        });
    });
    req.on('error',function(err){
       callback(err.message,null);
    });
    req.setTimeout(5000, function() {
        callback('error:' + params + ' timeout!', null);
    });
    req.write(content);
    req.end();
}
/**
 *
 * @param header
 * @param params
 * @param post_body
 */
httpClient.get = function(header, params, post_body,callback) {
   this.request('get', header, params, post_body, callback);
}

/**
 *
 * @param header
 * @param params
 * @param post_body
 */
httpClient.post = function(header, params, post_body,callback) {
    this.request('post', header, params, post_body, callback);
}