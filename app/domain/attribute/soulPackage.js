/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-12-29
 * Description: soulPackage
 */
var util = require('util');
var dataApi = require('../../utils/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var buff = require('../buff');
var Persistent = require('../persistent');
var utils = require('../../utils/utils');
var BasePackage = require('../package/basePackage');

/**
 *
 * @param opts
 * @constructor
 */
var SoulPackage = function(opts) {
    BasePackage.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.cId = opts.cId;
    this.items = opts.items;
    this.itemCount = opts.itemCount || 12;
    this.indexStart = 0;
};

util.inherits(SoulPackage, BasePackage);

module.exports = SoulPackage;

SoulPackage.create = function(opts) {

}

SoulPackage.prototype.isFull = function() {
    var count = 0;
    for(var i = this.indexStart, l = this.itemCount + this.indexStart; i < l; i++ ) {
        if(this.items[i]) {
            count++;
        }
    }
    if(this.itemCount == count) {
        return true;
    } else {
        return false;
    }
}

SoulPackage.prototype.addItem = function(player, item, rIndex) {
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
                level: item.level || 1,
                starLevel: 0
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

SoulPackage.prototype.checkItemsWithPackageIndex = function(indexs) {
    var items = [];
    for(var i = 0 ; i < indexs.length ; i++) {
        if (!this.items[indexs[i]]) {
            return items;
        } else {
            items.push({
                index: indexs[i],
                itemId: this.items[indexs[i]].itemId,
                itemNum: this.items[indexs[i]].itemNum
            });
        }
    }
    return items;
}