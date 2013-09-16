/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-17
 * Description: testUcenter
 */
var should = require('should');
var ucenter = require('../../app/lib/ucenter/ucenter');

describe('ucenter test', function() {
    it('should successully', function() {
        var date = new Date();
        var data = {
            serverId: 1,
            registerType: 1,
            loginName: "wozlla",
            characterId: 10,
            induId: "",
            induData: {},
            date: date.getTime(),
            enterDate: date.getTime(),
            finishDate: date.getTime(),
            isFinished: 1
        }
        ucenter.saveInduLog(data);
    });
});