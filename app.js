/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-21
 * Description: app
 */
var express = require('express')
    , route = require('./route')
    , urlrouter = require('urlrouter')
    , http = require('http')
    , path = require('path')
    , forward = require('forward')
    , connect = require('connect')
    , config = require('./config')
    , fs = require('fs')
    , utils = require('./app/utils/utils')
    , redis = require('./app/dao/redis/redis');

var app = express();

utils.doProcess(process);
// all environments
app.set('port', process.env.PORT || 4011);
//app.use(express.favicon());

//log
//app.use(express.logger('dev'));
express.logger.format('home', ':remote-addr :response-time - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :res[content-length]');
app.use(express.logger({
    format: 'home',
    stream: fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'})
}));

//app.use(express.bodyParser());
// keepExtensions: true

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('html5'));
app.use(express.session());
//app.use(app.router);
app.use(urlrouter(route));

// 初始化redis连接
redis.init();

/**
 * Error handler
 */
app.use(function (err, req, res, next) {
    err.url = err.url || req.url;
    console.log(err.stack);
    res.statusCode = err.status || 500;
    res.send({
        status: 500
    });
});

/**
 * Page not found handler
 */
app.use(function (req, res, next) {
    res.statusCode = 404;
    res.send({
        status: 404
    });
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express started on port ' + app.get('port'));
});