var http = require('http');
var redis = require("redis"),
	client = redis.createClient();

var server = http.createServer(function(request, response) {
	response.writeHead(200, {'Content-Type':'text/plain'});
	client.get("foo", function(err, reply) {
		response.end('Hello ' + reply + '\n');
	});
	//response.end('Hello World\n');
});

server.listen(8080);
console.log('Server running at 8080');