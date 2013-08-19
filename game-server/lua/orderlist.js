/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-08-18
 * Description: orderlist
 */

var redis = require('redis');
var client = redis.createClient(6379, "192.168.1.22");
var crypto = require('crypto');

var orderlist = {

};

module.exports = orderlist;

orderlist.random = function() {
    console.log("random");

    var key = "mylist";
    client.del("mylist");
    var lua_script = "local i = tonumber(ARGV[1]) \
            local res \
            redis.call('select', 0) \
            while (i > 0) do \
                res = redis.call('lpush',KEYS[1],math.random()) \
                i = i-1 \
            end \
            return res";

    var lua_script_sha = "";
    lua_script_sha = "6b1bf486c81ceb7edf3c093f4c48582e38c0e791";
    lua_script_sha = "d03f11ff40dba7c386c3bcaa550f7512c808d3c0";// SHA1


    var shasum = crypto.createHash('sha1');
    shasum.update(lua_script);
    lua_script_sha = shasum.digest('hex');
    console.log(lua_script_sha);
    client.EVALSHA(lua_script_sha, 1, "mylist", 10, function(err, reply) {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        console.log(err);
        if(err) {
            client.EVAL(lua_script, 1, "mylist", 10, function(err, reply) {
                console.log("tttttttttttttttttttttttttttttttttttt");
                console.log(reply);
            });
        } else {
            console.log(reply);
        }
    });
}

orderlist.ordermail = function() {
    console.log("ordermail");

    var lua_script = "local key = ARGV[2] \
        local mails \
        local mail \
        local res = {} \
        local curPage = ARGV[3] \
        local perPage = ARGV[4] \
        redis.log(redis.LOG_NOTICE, ARGV[2]) \
        redis.call('select', ARGV[1]) \
        mails = redis.call('lrange', key, 0, -1) \
        local spairs = function(t, order) \
            local keys = {} \
            local item = {} \
            for index, value in pairs(t) do \
                table.insert(keys, index) \
            end \
            \
            if order then \
                table.sort(keys, function(a, b) \
                    return order(t, a, b) \
                end) \
            else \
                table.sort(keys) \
            end \
            \
            local i = 0 \
            return function() \
                i = i + 1 \
                if keys[i] then \
                    return keys[i], t[keys[i]] \
                end \
            end \
        end \
        local paging = function(items, curPage, perPage) \
            local result = {} \
            local allnum = table.getn(items) \
            local allpage = math.ceil(allnum / perPage) \
            redis.log(redis.LOG_NOTICE, curPage) \
            redis.log(redis.LOG_NOTICE, allpage) \
            curPage = tonumber(curPage) \
            redis.log(redis.LOG_NOTICE, tonumber(curPage) < 1) \
            if(tonumber(curPage) < 1) then \
                curPage = 1 \
            end \
            if(tonumber(curPage) > allpage) then \
                curPage = allpage \
            end \
            local _start = (curPage - 1) * perPage + 1 \
            local _end = curPage * perPage \
            redis.log(redis.LOG_NOTICE, _start) \
            redis.log(redis.LOG_NOTICE, _end) \
            for iIndex, tValue in ipairs( items ) \
            do \
                if(tonumber(iIndex) >= _start) then \
                    if(tonumber(iIndex) <= _end) then \
                        table.insert(result, tValue) \
                    end \
                end \
            end \
            res = result \
        end \
        for iIndex, tValue in spairs( mails, function(t, a, b) \
            local _a = {} \
            local _b = {} \
            local flag = false \
            _a = cjson.decode(t[a]) \
            _b = cjson.decode(t[b]) \
            flag = _a.bz < _b.bz \
            if(_a.bz == _b.bz) then \
                flag = _a.date > _b.date \
            end \
            return flag end) \
        do \
            redis.log(redis.LOG_NOTICE, tValue) \
            table.insert(res, tValue) \
        end \
        paging(res, curPage, perPage) \
        return res";

    var lua_script_sha = "";

    var shasum = crypto.createHash('sha1');
    shasum.update(lua_script);
    lua_script_sha = shasum.digest('hex');
    console.log(lua_script_sha);
    client.EVALSHA(lua_script_sha, 4, "db", "key", "curPage", "perPage", 1, "S1_T1_wozlla_C10_ER", 1, 2, function(err, reply) {
        if(err) {
            client.EVAL(lua_script, 4, "db", "key", "curPage", "perPage", 1, "S1_T1_wozlla_C10_ER", 1, 2, function(err, reply) {
                console.log(reply);
            });
        } else {
            console.log(reply);
        }
    });
}

orderlist.delmail = function(mailId) {
    console.log("delmail");

    var lua_script = "local key = ARGV[2] \
        local mails \
        local mail \
        local res = nil\
        local mailId = ARGV[3] \
        redis.log(redis.LOG_NOTICE, ARGV[2]) \
        redis.call('select', ARGV[1]) \
        mails = redis.call('lrange', key, 0, -1) \
        for iIndex, tValue in ipairs( mails ) \
        do \
            mail = cjson.decode(tValue) \
            redis.log(redis.LOG_NOTICE, mail.emailId) \
            redis.log(redis.LOG_NOTICE, mailId) \
            if(tonumber(mail.emailId) == tonumber(mailId)) then \
                redis.call('lrem', key, 0, tValue) \
                res = mailId \
            end \
        end \
        return res";

    var lua_script_sha = "";

    var shasum = crypto.createHash('sha1');
    shasum.update(lua_script);
    lua_script_sha = shasum.digest('hex');
    console.log(lua_script_sha);
    client.EVALSHA(lua_script_sha, 3, "db", "key", "mailId", 1, "S1_T1_wozlla_C10_ER", 1, function(err, reply) {
        if(err) {
            client.EVAL(lua_script, 3, "db", "key", "mailId", 1, "S1_T1_wozlla_C10_ER", 1, function(err, reply) {
                console.log(reply);
            });
        } else {
            console.log(reply);
        }
    });
}

function main() {
    orderlist.ordermail();
    orderlist.delmail();
}

main();

