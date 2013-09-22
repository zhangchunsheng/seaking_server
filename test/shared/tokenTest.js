/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-30
 * Description: tokenTest
 */
var should = require('should');
var token = require('../../../shared/token');

describe('Token service test', function() {
    it('should create and parse the token successully with the same password', function() {
        var pwd = 'wozlla_session_secret';
        var userInfo = {
            registerType: 1,
            loginName: "wozlla",
            userId: '1'
        };
        var timestamp = Date.now();
        var t = token.create(userInfo, timestamp, pwd);
        console.log(t);
        should.exist(t);
        var res = token.parse(t, pwd);
        console.log(res);
        should.exist(res);
        userInfo.userId.should.equal(res.uid);
        timestamp.should.equal(res.timestamp);
    });

    it('should fail if use invalid password to parse the token', function() {
        var pwd = 'wozlla_session_secret';
        var invalidPwd = 'invalid_session_secret';
        var userInfo = {
            registerType: 1,
            loginName: "test",
            userId: '123456'
        };
        var timestamp = Date.now();
        var t = token.create(userInfo, timestamp, pwd);
        console.log(t);
        should.exist(t);
        var res = token.parse(t, invalidPwd);
        should.not.exist(res);
    });
});