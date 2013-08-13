/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-28
 * Description: package
 */
var util = require('util');
var Entity = require('./entity/entity');
var EntityType = require('../consts/consts').EntityType;
var Persistent = require('./persistent');
var logger = require('pomelo-logger').getLogger(__filename);
var PackageType = require('../consts/consts').PackageType;

/**
 * Initialize a new 'Package' with the given 'opts'
 * Package inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Package = function(opts) {
    logger.info(opts);
    Persistent.call(this, opts);
    this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.weapons = {
        itemCount: opts.weapons.itemCount,
        items: opts.weapons.items
    };
    this.equipments = {
        itemCount: opts.equipments.itemCount,
        items: opts.equipments.items
    };
    this.items = {
        itemCount: opts.items.itemCount,
        items: opts.items.items
    };

};

var dict = [
    "weapons",
    "equipments",
    "items"
];

util.inherits(Package, Persistent);

module.exports = Package;

Package.prototype.get = function(type, index) {
    return this[type].items[index];
};

Package.prototype.getData = function(type) {
    var data = {};

    data.itemCount = this[type].itemCount;

    data.items = [];
    for(var key in this[type].items) {
        var item = {
            key : Number(key),
            itemId : this[type].items[key].itemId,
            itemNum: this[type].items[key].itemNum
        };
        data.items.push(item);
    }

    return data;
};

/**
 * add item
 *
 * @param {obj} item {itemId: "W0101", itemNum: 3}
 * @return {number}
 * @api public
 */
Package.prototype.addItem = function(type, item, rIndex) {
    //var index =-1;
    var index = new Array();
    logger.info(item);
    if (!item || !item.itemId || !item.itemId.match(/W|E|D/)) {
        //返回{}并没有返回null 容易判断
    //    logger.info("1:"+index);
        return index;
    }

    if(rIndex) {
        if(this[type].items[rIndex]) {
            delete this[type].items[rIndex];
        }
    }

    if(type == PackageType.WEAPONS || type == PackageType.EQUIPMENTS) {
        for (var i = 1; i <= this[type].itemCount; i++) {
            if (!this[type].items[i]) {
                this[type].items[i] = {
                    itemId: item.itemId,
                    itemNum: item.itemNum,
                    level: item.level
                };
               // index = i;
                index = [{index:i,itemNum:item.itemNum}];
               // logger.info("2:"+index);
                break;
            }
        }
    } else {
        var flag = false;
        /*
        for (var i = 1; i <= this[type].itemCount; i++) {
            if(typeof this[type].items[i] != "undefined" && this[type].items[i].itemId == item.itemId) {
                flag = true;
                this[type].items[i].itemNum += item.itemNum;
                if(this[type].items[i].itemNum > 99) {
                    this[type].items[i].itemNum = 99;
                }
                index = i;
                break;
            }
        }
        if(!flag) {
            for (var i = 1; i <= this[type].itemCount; i++) {
                if (!this[type].items[i]) {
                    this[type].items[i] = {
                        itemId: item.itemId,
                        itemNum: item.itemNum,
                        level: item.level
                    };
                    index = i;
                    break;
                }
            }
        }
        */
        for(var i  in  this[type].items){
            if(this[type].items[i].itemId == item.itemId ){
                console.log(parseInt(this[type].items[i].itemNum)+parseInt(item.itemNum));
                if(parseInt(this[type].items[i].itemNum)+parseInt(item.itemNum) > 99 && this[type].items[i].itemNum<99){
                      var spaceCount=0;
                      //数格子,如果是数组的话可以用this[type].items.length，可抽出方法来
                      for(var n in this[type].items){
                          spaceCount ++;
                      }
                      //限定了最多99个 所以只要简单的判断是否有个空格子就可以了
                      if(spaceCount + 1>this[type].itemCount){
                         // logger.info("3:"+index);
                          return index;
                      }
                      item.itemNum = parseInt(this[type].items[i].itemNum)+parseInt(item.itemNum)-99;
                      this[type].items[i].itemNum = 99;
                      index.push({index:i,itemNum:99});
             //       logger.info("4:"+index);
                }else if(this[type].items[i].itemNum<99){
                     this[type].items[i].itemNum = parseInt(this[type].items[i].itemNum)+parseInt(item.itemNum);

                     index.push({index:i,itemNum:this[type].items[i].itemNum});
            //        logger.info("5:"+index);
                     flag = true;
                     break;
                }

            }
        }
        if(!flag){
            var spaceCount=0;
            for(var n in this[type].items){
                spaceCount ++;
            }
            if(spaceCount +1 >this[type].itemCount){
            //    logger.info("6:"+index);
                return index;
            }
            for(var i=1;i<=this[type].itemCount;i++){
                if(!this[type].items[i]){
                    //一定小于99个所以直接添加就好了
                    this[type].items[i]={
                        itemId: item.itemId,
                        itemNum: item.itemNum,
                        level: item.level
                    };
                    index.push({index:i,itemNum:item.itemNum});
                //    logger.info("7:"+index);
                    break;
                }
            }
        }
    }

    //if (index > 0) {
    if(index.length>0){
        this.save();
    }
   // logger.info("8:"+index);
    return index;
};

/**
 * addEquipment
 */
Package.prototype.addEquipment = function(type, item) {
    var index = -1;
    for (var i = 1; i <= this[type].itemCount; i++) {
        if (!this[type].items[i]) {
            this[type].items[i] = {
                itemId: item.itemId,
                itemNum: item.itemNum,
                level: item.level
            };
            index = i;
            break;
        }
    }
    return index;
}

/**
 * 添加除武器装备外物品
 */
Package.prototype.addItems = function(type, item) {
    var index = -1;
    var flag = false;
    for (var i = 1; i <= this[type].itemCount; i++) {
        if(this[type].items[i].itemId == item.itemId) {
            flag = true;
            this[type].items[i].itemNum += item.itemNum;
            if(this[type].items[i].itemNum > 99) {
                this[type].items[i].itemNum = 99;
            }
            index = i;
            break;
        }
    }
    if(!flag) {
        index = this.addEquipment(type, item);
    }
    return index;
}

Package.prototype.addItemWithNoType = function(item) {
    var type = "";
    if(item.itemId.indexOf("W") >= 0) {
        type = PackageType.WEAPONS;
    } else if(item.itemId.indexOf("E") >= 0) {
        type = PackageType.EQUIPMENTS;
    } else {
        type = PackageType.ITEMS;
    }
    this.addItem(type, item);
}

/**
 * remove item
 *
 * @param {number} index
 * @return {Boolean}
 * @api public
 */
Package.prototype.removeItem = function(type, index,itemNum) {
    var status = false;
    logger.info(index);
    logger.info(this[type].items[index]);
    var item = this[type].items[index];
    if(item) {
        if(!itemNum || itemNum == item.itemNum){
            delete this[type].items[index];
            this.save();
            status = true;
        }else if(item.itemNum >itemNum){
            item.itemNum -= itemNum;
            this.save();
            status = true;
        }
    }

    return status;
};

//Check out item by id and type
Package.prototype.checkItem = function(type, index, itemId) {
    var result = 0, i, item;
    item = this[type].items[index];
    if(!item){
        return result;
    }else if (item.itemId == itemId) {
        result = item.itemNum;
    }

    return result;
};

Package.prototype.hasItem = function(type, itemId) {
    var result = 0, i, item;

    for(i in this[type].items) {
        item = this[type].items[i];
        if (item.itemId == itemId) {
            result = i;
            break;
        }
    }

    return result;
}

//Get all the items
Package.prototype.all = function() {
    return {
        weapons: this.weapons,
        equipments: this.equipments,
        items: this.items
    };
};

/**
 * strip
 */
Package.prototype.strip = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    return {
        characterId: characterId,
        serverId: this.serverId,
        registerType: this.registerType,
        loginName: this.loginName,
        weapons: this.weapons,
        equipments: this.equipments,
        items: this.items
    }
};

/**
 * getInfo
 */
Package.prototype.getInfo = function() {
    return {
        weapons: this.weapons,
        equipments: this.equipments,
        items: this.items
    }
};
