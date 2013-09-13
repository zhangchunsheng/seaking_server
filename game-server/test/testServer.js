/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-13
 * Description: testServer
 */
var http = require('http');
var redis = require("./redis/redis");

var server = http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    redis.command(function(client) {
        client.get("foo", function(err, reply) {
            redis.release(client);
            response.end('Hello ' + reply + '\n');
        });
    });
    //response.end('Hello World\n');
});

redis.init();

server.listen(8080);
console.log('Server running at 8080');