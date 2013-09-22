/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-18
 * Description: orderlistTest
 */
var should = require('should');
var orderlist = require('../../lua/orderlist');

describe('orderlist test', function() {
    it('should successully', function() {
        orderlist.ordermail();

        var result = {};

        result.should.equal(result);
    });
});