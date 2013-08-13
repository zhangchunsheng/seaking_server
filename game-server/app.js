/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-22
 * Description: app
 */
var pomelo = require('pomelo');
var world = require('./app/domain/world');
var area = require('./app/domain/area/area');
var dataApi = require('./app/util/dataApi');
var routeUtil = require('./app/util/routeUtil');
var playerFilter = require('./app/servers/area/filter/playerFilter');
var ChatService = require('./app/services/chatService');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'kouwanju');

// configure for global
app.configure('production|development', function() {
    var sceneInfo = require('./app/modules/sceneInfo');
    var onlineUser = require('./app/modules/onlineUser');
    if(typeof app.registerAdmin === 'function'){
        app.registerAdmin(sceneInfo, {app: app});
        app.registerAdmin(onlineUser, {app: app});
    }
    //Set areasIdMap, a map from area id to serverId.
    if (app.serverType !== 'master') {
        var areas = app.get('servers').area;
        var areaIdMap = {};
        for(var id in areas){
            areaIdMap[areas[id].area] = areas[id].id;
        }
        app.set('areaIdMap', areaIdMap);
    }
    // proxy configures
    app.set('proxyConfig', {
        cacheMsg: true,
        interval: 30,
        lazyConnection: true,
        enableRpcLog: true
    });

    // remote configures
    app.set('remoteConfig', {
        cacheMsg: true,
        interval: 30
    });

    // route configures
    app.route('area', routeUtil.area);
    app.route('connector', routeUtil.connector);

    app.loadConfig('redis', app.getBase() + '/../shared/config/redis.json');
    app.loadConfig('regionInfo', app.getBase() + '/config/region.json');
    app.filter(pomelo.filters.timeout());
});

// Configure for auth server
app.configure('production|development', 'auth', function() {
    // load session congfigures
    app.set('session', require('./config/session.json'));
});

// Configure for area server
app.configure('production|development', 'area', function() {
    app.filter(pomelo.filters.serial());
    app.before(playerFilter());

    var areaId = app.get('curServer').area;
    if(!areaId || areaId < 0) {
        throw new Error('load area config failed');
    }
    world.init(dataApi.city.all());
    area.init(dataApi.city.findById(areaId));
});

// Configure database
app.configure('production|development', 'gate|area|scene|battle|auth|connector|master', function() {
    var redisclient = require('./app/dao/redis/redis').init(app);
    app.set('redisclient', redisclient);
    app.set('dbclient', redisclient);
    app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: redisclient});
});

// app configuration
app.configure('production|development', 'connector', function(){
    var dictionary = app.components['__dictionary__'];
    var dict = null;
    if(!!dictionary) {
        dict = dictionary.getDict();
    }
	app.set('connectorConfig',
		{
			//connector : pomelo.connectors.hybridconnector,
            connector : pomelo.connectors.sioconnector,
			heartbeat : 3,
			useDict : true,
			useProtobuf : true,
            handshake: function(msg, cb) {
                cb(null, {});
            }
		});
});

app.configure('production|development', 'gate', function() {
    app.set("connectorConfig", {
        //connector: pomelo.connectors.hybridconnector
        connector: pomelo.connectors.sioconnector
    });
});

// Configure for chat server
app.configure('production|development', 'chat', function() {
    app.set('chatService', new ChatService(app));
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
