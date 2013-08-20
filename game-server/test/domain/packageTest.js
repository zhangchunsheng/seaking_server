/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-19
 * Description: packageTest
 */
var should = require('should');
var Package = require('../../app/domain/package');

describe('package test', function() {
    it('should successully', function() {
        var obj = {
            "weapons":{"itemCount":9,"items":{"2":{"itemId":"W0201","itemNum":1,"level":1}}},
            "equipments":{"itemCount":9,"items":{}},
            "items":{"itemCount":9,"items":{"1":{"itemId":"D10010101","itemNum":2,"level":1}}}
        };

        var pagekageEntity = new Package(obj);
        var items = {
            itemId: "W0201",
            itemNum: 1
        }
        console.log(pagekageEntity.hasItems(items));

        var result = {};

        result.should.equal(result);
    });
});