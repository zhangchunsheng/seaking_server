/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: app
 */
var express = require('express');
var Token = require('../shared/token');
var secret = require('../shared/config/session').secret;
var userDao = require('./lib/dao/userDao');
var app = express.createServer();
var redis = require('./lib/dao/redis/redis');
var everyauth = require('./lib/oauth');

var publicPath = __dirname +  '/public';

app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: "kouwanju"}));
    app.use(everyauth.middleware());
    app.use(app.router);
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.set('view options', {layout: false});
    app.set('basepath', publicPath);
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/auth_success', function(req, res) {
    if (req.session.userId) {
        var token = Token.create(req.session.userId, Date.now(), secret);
        res.render('auth', {code: 200, token: token, uid: req.session.userId});
    } else {
        res.render('auth', {code: 500});
    }
});

app.post('/login', function(req, res) {
    var msg = req.body;

    var loginName = msg.loginName;
    var pwd = msg.password;
    if (!loginName || !pwd) {
        res.send({code: 500});
        return;
    }
    msg.registerType = 1;

    userDao.login(msg, function(err, result) {
        if (err || !result) {
            console.log(err.msg);
            res.send({code: 500});
            return;
        }

        console.log(loginName + ' login!');
        console.log({
            code: 200,
            token: Token.create(result, Date.now(), secret),
            uid: result.userId,
            registerType: msg.registerType,
            loginName: msg.loginName,
            sessionId: result.sessionId,
            message: result.message.register_success
        });
        res.send({
            code: 200,
            token: Token.create(result, Date.now(), secret),
            uid: result.userId,
            registerType: msg.registerType,
            loginName: msg.loginName,
            sessionId: result.sessionId,
            message: result.message.register_success
        });
    });
});

app.post('/register', function(req, res) {
    //console.log('req.params');
    var msg = req.body;
    console.log(msg);
    if (!msg.loginName || !msg.password) {
        res.send({code: 500});
        return;
    }
    msg.registerType = 1;

    console.log(userDao);

    userDao.createUser(msg, '', function(err, result) {
        if (err || !result) {
            console.error(err);
            if (err && err.code === 1062) {
                res.send({code: 501});
            } else {
                res.send({code: 500});
            }
        } else {
            console.log('A new user was created! --' + msg.loginName);
            res.send({
                code: 200,
                token: Token.create(result, Date.now(), secret),
                uid: result.userId,
                registerType: msg.registerType,
                loginName: msg.loginName,
                sessionId: result.sessionId,
                message: result.message.register_success
            });
        }
    });
});

redis.init();

app.listen(4001);

// Uncaught exception handler
process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
});

console.log("Web server has started.\nPlease log on http://127.0.0.1:4001/index.html");
