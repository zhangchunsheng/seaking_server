/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-29
 * Description: testChat
 */
var net = require('net');

var client = net.connect({host: "192.168.1.22", port: 4101},
    function() {
        console.log('client connected');
        client.write('world!\r\n');
    }
);

client.on('data', function(data) {
    console.log(data.toString());
    client.end();
});

client.on('end', function() {
    console.log('client disconnected');
});

client.on('error', function(err) {
    console.log(err);
});