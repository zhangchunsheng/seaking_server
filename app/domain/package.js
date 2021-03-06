var util = require('util');
var Entity = require('./entity/entity');
var EntityType = require('../consts/consts').EntityType;
var Persistent = require('./persistent');
var PackageType = require('../consts/consts').PackageType;
var consts = require('../consts/consts');
var utils = require("../utils/utils");
var dataApi = require("../utils/dataApi");
var packageStart = 0;
var Package = function(opts){
	Persistent.call(this, opts);
  	this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.items = opts.items;
    this.itemCount = (opts.itemCount - 0) || 12;
}
util.inherits(Package, Persistent);
module.exports = Package;
Package.prototype.getItemType = function(item) {
     var one = item.itemId.substring(0,1);
    switch(one) {
        case "D":
            return PackageType.ITEMS;
        break;
        case "E":
            return PackageType.EQUIPMENTS;
        break;
        case "W":
            return PackageType.WEAPONS;
        break;
        case "C":
            return PackageType.Material;
        break;
        case "T":
            return PackageType.Task;
        break;
        case "B":
            return PackageType.DIAMOND;
        break;
    }
}
Package.prototype.get = function(type, index) {
    if(!index) {
        index = type;
        type = null;
    }
	return this.items[index];
}

Package.prototype.syncData = function() {

}

Package.prototype.checkItem = function(index, itemId) {
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

Package.prototype.removeItem = function(index, itemNum) {
    var item =  this.items[index];
    console.log("itemNum:",itemNum);
    if(item.itemNum < itemNum) {
        return null;
    }
    item.itemNum = item.itemNum - (itemNum - 0);
    if(item.itemNum <= 0) {
        delete this.items[index];
    }
    this.save();
    return item;
}
Package.prototype.unlock = function(end) {
    this.itemCount = end;
}
Package.prototype.hasItem = function(_item) {
	var flag = [];
	var num = _item.itemNum;
	for(var i = packageStart, l = this.itemCount + packageStart; i < l; i++ ) {
		if(this.items[i] && this.items[i].itemId == _item.itemId) {
			var item = this.items[i];
			if(num > item.itemNum) {
				num = num - item.itemNum;
				flag.push({
                    index: i,
                    item: item
                });
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
Package.prototype.__removeItems = function(items, mode ) {
    console.log("_removeItems:", JSON.stringify(items));
    var _items = [];
    for(var i = 0, l = items.length; i < l ; i++) {
        var a = [];
        var itemId ;
        for(var n = 0, nl = items[i].length ; n < nl; n++) {
            var item = items[i][n];
            console.log(item);
            var _item = this.removeItem(item.index, item.item.itemNum);
            if(!_item) {
                return null;
            }
            a.push({
                index: item.index,
                item: _item
            });
        }
        if(!mode) {
            _items = _items.concat(a);
        }else{
            _items.push(a);
        }

    }
    return  _items;
}

//remove 中 update
Package.prototype._removeItems = function(items, mode ) {
    console.log("_removeItems:", JSON.stringify(items));
    var _items = [];
    for(var i = 0, l = items.length; i < l ; i++) {
        var a = [];
        var itemId ;
        for(var n = 0, nl = items[i].length ; n < nl; n++) {
            var item = items[i][n];
            itemId = item.itemId;
            var _item = this.removeItem(item.index, item.itemNum);
            if(!_item) {
                return null;
            }
            a.push({
                index: item.index,
                item: _item
            });
        }
        if(!mode) {
            _items = _items.concat(a);
        }else{
            _items.push(a);
        }

    }
    return  _items;
}
Package.prototype.removeItems = function(items) {
    var _items = [];
    for(var i  = 0, l = items.length ; i < l; i++) {
        for(var n = 0 , nl = items[i].length ; n < nl ; n++ ) {
            var item = items[i][n];
            var _item = this.removeItem(item.index, item.itemNum);
            if(!_item){
                return null;
            }
            _items.push(_item);
        }
    }
    return _items;
}
/**
 * 检索材料
 * @param materials []
 * @returns {*}
 */
Package.prototype.checkMaterial = function(materials) {
    var flag = [];
    var items = [];
    var material;
    var num;
    var item;
    for(var i = 0 ; i < materials.length ; i++) {
        material = materials[i];
        num = material.itemNum;
        items = [];
        for(var j = packageStart, l = this.itemCount + packageStart ; j < l ; j++ ) {
            if(this.items[j] && this.items[j].itemId == material.itemId) {
                item = this.items[j];
                if(num > item.itemNum) {
                    num = num - item.itemNum;
                    items.push({
                        index: j,
                        itemId: item.itemId,
                        itemNum: item.itemNum
                    });
                } else {
                    items.push({
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
            flag.push(items);
        } else {
            return [];
        }
    }
    if(flag.length == materials.length) {
        return flag;
    } else {
        return [];
    }
}

/**
 * 检索物品
 * @param items
 * @returns {Array}
 */
Package.prototype.checkItems = function(items) {
    var flag = [];
    var _items = [];
    var _item;
    var num;
    var item;
    for(var i = 0 ; i < items.length ; i++) {
        _item = items[i];
        num = _item.itemNum;
        _items = [];
        for(var j = packageStart, l = this.itemCount + packageStart ; j < l ; j++ ) {
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
    if(flag.length >= items.length) {
        return flag;
    } else {
        return [];
    }
}

/**
 *
 * @param needChangedDiamonds
 */
Package.prototype.checkDiamonds = function(needChangedDiamonds) {
    return this.checkItems(needChangedDiamonds);
}

Package.prototype.addItemWithNoType = function(player, item) {
	var type = "";
    if(item.itemId.indexOf("W") >= 0) {
        type = PackageType.WEAPONS;
    } else if(item.itemId.indexOf("E") >= 0) {
        type = PackageType.EQUIPMENTS;
    } else if(item.itemId.indexOf("B") >= 0) {
        type = PackageType.DIAMOND;
    } else {
        type = PackageType.ITEMS;
    }
    return this.addItem(player, type, item);
}

function sort1(array, max) {
    for(var i =array.length-1;i> 0;i--) {
        for(var l = 0,len = i;l<len;l++) {
            if(array[l].itemId < array[l+1].itemId ){
                var t = array[l];
                array[l] = array[l+1];
                array[l+1] = t;
            }else if(array[l].itemId == array[l+1].itemId){
                array[l].itemNum  =(array[l].itemNum-0) + (array[l+1].itemNum -0);
                if(max) {
                   if(array[l].itemNum > max) {
                    array[l+1].itemNum = array[l].itemNum - max;
                    array[l].itemNum  = max;
                    
                    }else {
                        array[l+1].itemNum= 0;
                    } 
                }else {
                    var  itemInfo;
                    if(array[l].itemId.indexOf("D") >= 0) {
                        itemInfo = dataApi.item.findById(array[l].itemId);
                    }else if(array[l].itemId.indexOf("B") >= 0) {
                        itemInfo = dataApi.diamonds.findById(array[l].itemId);
                    } 
                    console.log("itemIn",itemInfo);
                    if(!itemInfo){itemInfo.pileNum = 99;}
                    var _max = itemInfo.pileNum - 0 ||99;
                    if(array[l].itemNum > _max) {
                        array[l+1].itemNum = array[l].itemNum - _max;
                        array[l].itemNum  = _max;
                    
                    }else {
                        array[l+1].itemNum= 0;
                    } 
                }
                
            }
        }
    }
    return array;
} ;


Package.prototype.arrange = function(callback) {
    var items = this.items;
    var Cs = []
        , Es = []
        , Ws = []
        , Ds = []
        , Ts = []
        , Bs = [];
    for(var i = packageStart,l = this.itemCount + packageStart; i < l ;i++) {
        if(items[i]){
            var item = items[i];
            var type = item.itemId.substring(0,1);
            switch(type) {
                case "C":
                    Cs.push(item);
                    break;
                case "E":
                    Es.push(item);
                    break;
                case "W":
                    Ws.push(item);
                    break;
                case "D":
                    Ds.push(item);
                    break;
                case "T":
                    Ts.push(item);
                    break;
                case "B":
                    Bs.push(item);
            }
        }
    }
    var sortFun1 = function(a, b) {
        if(a.itemId > b.itemId) {
            return 1;
        } else if(a.itemId < b.itemId) {
            return -1;
        } else {
            if(a.level) {
                if(a.level == b.level) {
                    if(a.itemNum) {
                        if(a.itemNum != 0 && b.itemNum != 0) {
                            var all =  (a.itemNum - 0) + (b.itemNum -0);
                            var itemInfo = dataApi.item.findById(a.itemId);
                            itemInfo.pileNum = itemInfo.pileNum || 99;
                            if(all > itemInfo.pileNum) {
                                a.itemNum = itemInfo.pileNum;
                                b.itemNum = all - itemInfo.pileNum;
                            } else {
                                a.itemNum = all;
                                b.itemNum = 0;
                            }
                            return 0;
                        } else if(a.itemNum == 0){
                            return -1;
                        }else if(b.itemNum == 0) {
                            return 1;
                        }                       
                    }
                    
                
                } else {
                    if(a.level > b.level) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            }else {
                if(a.itemNum ) {

                }
            }
            
        }
    };
    var sortFun2 = function(a, b) {
        if(a.itemId) {
            if( a.itemId > b.itemId) {
                return 1;
            } else if( a.itemId < b.itemId) {
                return -1;
            } else if( a.itemId == b.itemId){
                if(a.level) {
                    if(a.level >= b.level) {
                        return 1;                        
                    }else if(a.level < b.level) {
                        return -1;
                    }
                }
                return 0;
            }
        }else {
            console.log(a);
            return -1;
        }
    }
    Cs = sort1(Cs);
    Es.sort(sortFun2);
    Ws.sort(sortFun2);
    Ds = sort1(Ds);
    Ts = sort1(Ts);
    Bs = sort1(Bs);
    /*Cs.sort(sortFun1);
    Es.sort(sortFun2);
    Ws.sort(sortFun2);
    Ds.sort(sortFun1);
    Ts.sort(sortFun1);
    Bs.sort(sortFun1);*/
    var all = [];
    all = all.concat(Cs, Es, Ws, Ds, Ts, Bs);

    var json = arrayToJson(all);
    console.log(json);
    this.items = json;
    this.save();
    callback(null, {
        itemCount: this.itemCount,
        items: json
    });
}

var arrayToJson = function(array) {
    var json = {};
    var n = packageStart;
    for(var i = 0,l = array.length ; i < l ; i++) {
        if(array[i] && array[i].itemNum != 0){
            json[n] = array[i];
            n++;
        }       
    }
    return json;
}

Package.prototype.addItem = function(player, type, item, rIndex) {
    var itemInfo = {};
    if(type.pileNum) {
        itemInfo = type;
    } else {
        switch(type) {
            case PackageType.EQUIPMENTS:
                itemInfo = dataApi.equipments.findById(item.itemId);
                break;
            case PackageType.WEAPONS:
                itemInfo = dataApi.weapons.findById(item.itemId);
                break;
            case PackageType.DIAMOND:
                itemInfo = dataApi.diamonds.findById(item.itemId);
                break;
            case PackageType.ITEMS:
                itemInfo = dataApi.item.findById(item.itemId);
                break;
            default:
                itemInfo.pileNum = 99;
        }
       // console.log("###itemInfo:",itemInfo);
    }
    var changes = [];
    var _items = utils.clone(item);
    if (!item || !item.itemId || !item.itemId.match(/W|E|D|B/)) {
        //返回{}并没有返回null 容易判断
        return null;
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
     console.log(items.itemCount  + packageStart);
    if(type == PackageType.WEAPONS || type == PackageType.EQUIPMENTS) {
        var flag = false;
        for (var i = packageStart; i < items.itemCount  + packageStart ; i++) {
            if (!items.items[i]) {
                flag = true;
                items.items[i] = {
                    itemId: item.itemId,
                    itemNum: item.itemNum,
                    level: item.level,
                    forgeLevel: item.forgeLevel || 0,
                    inlay: item.inlay || {count:6,diamonds:{}}
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
    } else if(!itemInfo.pileNum || itemInfo.pileNum == 1) {
        var flag = false;
        for (var i = packageStart; i < items.itemCount  + packageStart; i++) {
            if (!items.items[i]) {
                flag = true;
                items.items[i] = {
                    itemId: item.itemId,
                    itemNum: item.itemNum,
                    level: item.level,
                    forgeLevel: item.forgeLevel || 0,
                    inlay: item.inlay || {count:6,diamonds:{}}
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
    } else {
         for(var i in items.items) {
            if(items.items[i].itemId == item.itemId && items.items[i].itemNum < itemInfo.pileNum) {
                //_items.itemNum = parseInt(_items.itemNum) + parseInt(this.items[i].itemNum);
                var mitem = items.items[i];
                if(parseInt(mitem.itemNum) + parseInt(item.itemNum) > itemInfo.pileNum) {
                    item.itemNum =parseInt(item.itemNum) + parseInt(mitem.itemNum) - itemInfo.pileNum;
                    mitem.itemNum = itemInfo.pileNum;
                    changes.push({
                        index: i,
                        item: mitem
                    });

                } else if(parseInt(mitem.itemNum) + parseInt(item.itemNum) <= itemInfo.pileNum) {
                    mitem.itemNum = parseInt(mitem.itemNum) + parseInt(item.itemNum);
                    item.itemNum = 0 ;
                    changes.push({
                        index: i,
                        item: mitem
                    });
                    break; 
                }
            }
        }
        var run = function() {
            if(item.itemNum > 0) {
                var spaceCount = -1;
                for(var i = packageStart,l = items.itemCount+packageStart ; i < l ; i++) {
                    if(!items.items[i]) {
                        spaceCount = i;
                        break;
                    }
                }
                if(spaceCount == -1) {
                    return null;
                }
                if(item.itemNum > itemInfo.pileNum) {
                    // 一定小于99个所以直接添加就好了，传入数值最大99
                    items.items[spaceCount] = {
                        itemId: item.itemId,
                        itemNum: itemInfo.pileNum,
                        level: item.level
                    };
                    changes.push({
                        index: spaceCount,
                        item: items.items[spaceCount]
                    });
                    item.itemNum -= itemInfo.pileNum;

                    return run();
                }
                items.items[spaceCount] = {
                    itemId: item.itemId,
                    itemNum: item.itemNum,
                    level: item.level
                };
                changes.push({
                    index: spaceCount,
                    item: items.items[spaceCount]
                });
                return {index: changes};
            } else {
                return {index: changes}
            }
            
        }
            if(!run()) {
            	return null;
            }
        }
        var task;
        var r = {index: changes};
        if(changes.length > 0) {
            r.changeTasks = player.tasks.updateItem(item.itemId,this);
        }
        return r;
}

/**
 * 添加武器装备
 * @param player
 * @param type
 * @param item
 * @param rIndex
 * @returns {*}
 */
Package.prototype.addEquipment = function(player, type, item, rIndex) {
    var changes = [];
    var _items = utils.clone(item);
    if (!item || !item.itemId || !item.itemId.match(/W|E/)) {
        //返回{}并没有返回null 容易判断
        return null;
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
    if(type == PackageType.WEAPONS || type == PackageType.EQUIPMENTS) {
        var flag = false;
        for (var i = packageStart; i < items.itemCount + packageStart; i++) {
            if (!items.items[i]) {
                flag = true;
                items.items[i] = {
                    itemId: item.itemId,
                    itemNum: item.itemNum,
                    level: item.level,
                    forgeLevel: item.forgeLevel || 0,
                    inlay: item.inlay || {count:6,diamonds:{}}
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
    }
    var task;
    var r = {index: changes};
    if(changes.length > 0) {
        this.save();
        task = player.updateTaskRecord(consts.TaskGoalType.GET_ITEM, _items);
        r.task = task;
    }
    return r;
}

Package.prototype.clearPackage = function() {
    this.items = {};
}

Package.prototype.strip = function() {
    var characterId = this.playerId.substr(this.playerId.indexOf("C") + 1);
    //this.updateId();
    return {
        characterId: characterId,
        serverId: this.serverId,
        registerType: this.registerType,
        loginName: this.loginName,
        itemCount:this.itemCount,
        items:this.items
    }
};

Package.prototype.getInfo = function() {
	return {
		itemCount:this.itemCount,
		items: this.items
	};
}

Package.prototype.findAll  = function(itemId) {
    var num = 0;
    for(var i in this.items) {
        if(this.items[i].itemId == itemId){
            num += (this.items[i].itemNum -0);
        }
    }
    return num;
}