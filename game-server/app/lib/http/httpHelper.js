/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-14
 * Description: httpHelper
 */
var http = require('http');
var querystring = require('querystring');

var httpHelper = module.exports;

httpHelper.request = function(type, host, port, path, headers, params, post_body, cb) {
    var options = {
        host: host,
        port: port,
        path: path,
        headers: headers
    };

    var callback = function(response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
            var obj = JSON.parse(str);
            if(typeof cb == "function")
                cb(obj);
        });
    }

    http.request(options, callback).end();
}

httpHelper.get = function(host, port, path, headers, params, cb) {
    var options = {
        host: host,
        port: port,
        path: path,
        headers: headers
    };

    var callback = function(response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
            var obj = JSON.parse(str);
            if(typeof cb == "function")
                cb(obj);
        });
    }

    http.request(options, callback).end();
}

httpHelper.post = function(host, port, path, headers, params, post_body, cb) {
    var data = querystring.stringify(post_body);

    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    headers['Content-Length'] = Buffer.byteLength(data);
    var options = {
        host: host,
        port: port,
        path: path,
        method: 'POST',
        headers: headers
    };

    console.log(options);

    var callback = function(response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.setEncoding('utf8');

        response.on('end', function () {
            console.log(str);
            var obj = JSON.parse(str);
            if(typeof cb == "function")
                cb(obj);
        });
    }

    var req = http.request(options, callback);

    req.on("error", function(e) {

    });

    console.log(data);
    //This is the data we are posting, it needs to be a string or a buffer
    req.write(data);
    req.end();
}