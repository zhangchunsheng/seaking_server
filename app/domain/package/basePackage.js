/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2014-02-11
 * Description: basePackage
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('../buff');
var Persistent = require('../persistent');
var utils = require('../../utils/utils');

/**
 *
 * @param opts
 * @constructor
 */
var BasePackage = function(opts) {
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;
    this.items = opts.items;
    this.itemCount = opts.itemCount || 12;
    this.indexStart = 0;
};

util.inherits(BasePackage, Persistent);

module.exports = BasePackage;

BasePackage.create = function(opts) {

}

BasePackage.prototype.get = function(type, index) {
    if(!index) {
        index = type;
        type = null;
    }
    return this.items[index];
}

BasePackage.prototype.checkItem = function(index, itemId) {
    var item = this.items[index];
    if(item == null) {
        return null;
    }
    if(!itemId) {
        return item.itemNum;
    }
    if(item.itemId == itemId) {
        return item.itemNum;
    }
    return null;
}

BasePackage.prototype.removeItem = function(index, itemNum) {
    var item =  this.items[index];
    item.itemNum = item.itemNum - itemNum;
    if(item.itemNum <= 0) {
        delete this.items[index];
    }
    this.save();
    return item;
}

BasePackage.prototype.unlock = function(end) {
    this.itemCount = end;
}

BasePackage.prototype.hasItem = function(_item) {
    var flag = [];
    var num = _item.itemNum;
    for(var i = this.indexStart, l = this.itemCount + this.indexStart; i < l; i++ ) {
        if(this.items[i] && this.items[i].itemId == _item.itemId) {
            var item = this.items[i];
            if(num > item.itemNum) {
                num = num - item.itemNum;
                flag.push(item);
            } else {
                flag.push({
                    index: i,
                    item:{
                        itemId: item.itemId,
                        itemNum: num,
                        level: item.level
                    }
                });
                num = 0;
                return flag;
            }
        }
    }
    return null;
}

/**
 * 检索物品
 * @param items
 * @returns {Array}
 */
BasePackage.prototype.checkItems = function(items) {
    var flag = [];
    var _items = [];
    var _item;
    var num;
    var item;
    for(var i = 0 ; i < items.length ; i++) {
        _item = items[i];
        num = _item.itemNum;
        _items = [];
        for(var j = this.indexStart, l = this.itemCount + this.indexStart ; j < l ; j++ ) {
            if(this.items[j] && this.items[j].itemId == _item.itemId) {
                item = this.items[j];
                if(num > item.itemNum) {
                    num = num - item.itemNum;
                    _items.push({
                        index: j,
                        itemId: item.itemId,
                        itemNum: item.itemNum
                    });
                } else {
                    _items.push({
                        index: j,
                        itemId: item.itemId,
                        itemNum: num
                    });
                    num = 0;
                }
                if(num == 0) {
                    break;
                }
            }
        }
        if(num == 0) {
            flag.push(_items);
        } else {
            return [];
        }
    }
    if(flag.length == items.length) {
        return flag;
    } else {
        return [];
    }
}

BasePackage.prototype.addItem = function(player, item, rIndex) {
    var changes = [];
    var _items = utils.clone(item);
    if (!item || !item.itemId || !item.itemId.match(/H/)) {
        return {
            index: []
        };
    }
    if(rIndex) {
        if(this.items[rIndex]) {
            var _item =  this.items[rIndex];
            _item.itemNum = _item.itemNum - 1;
            if(_item.itemNum <= 0) {
                delete this.items[rIndex];
            }
        }
    }
    var items = this;

    var flag = false;
    for (var i = this.indexStart; i < items.itemCount + this.indexStart; i++) {
        if (!items.items[i]) {
            flag = true;
            items.items[i] = {
                itemId: item.itemId,
                itemNum: item.itemNum,
                level: item.level || 1
            };
            changes = [{
                index: i,
                item: items.items[i]
            }];
            break;
        }
    }
    if(!flag)
        return {
            index: []
        };

    var r = {index: changes};
    if(changes.length > 0) {
        this.save();
    }
    return r;
}

BasePackage.prototype.clearPackage = function() {
    this.items = {};
}

BasePackage.prototype.strip = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    return {
        characterId: characterId,
        serverId: this.serverId,
        registerType: this.registerType,
        loginName: this.loginName,
        itemCount:this.itemCount,
        items:this.items
    }
};

BasePackage.prototype.getInfo = function() {
    return {
        itemCount:this.itemCount,
        items: this.items
    };
}