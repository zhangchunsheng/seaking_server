var util = require('util');
var Entity = require('./entity/entity');
var EntityType = require('../consts/consts').EntityType;
var Persistent = require('./persistent');
var PackageType = require('../consts/consts').PackageType;
var consts = require('../consts/consts');
var utils = require("../utils/utils");

var packageStart = 1;
var Package = function(opts){
	Persistent.call(this, opts);
  	this.playerId = opts.characterId;
    this.serverId = opts.serverId;
    this.registerType = opts.registerType;
    this.loginName = opts.loginName;
    this.items = opts.items;
    this.itemCount = opts.itemCount;
}
util.inherits(Package, Persistent);
module.exports = Package;
Package.prototype.getItemType = function(item) {
     var one = item.itemId.substring(0,1);
    switch(one) {
        case "C":
            return PackageType.ITEMS;
        break;
        case "E":
            return PackageType.EQUIPMENTS;
        break;
        case "W":
            return PackageType.WEAPONS;
        break;
        case "D":
            return PackageType.Material;
        break;
        case "T":
            return PackageType.Task;
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
    console.log(itemNum)
    item.itemNum = (item.itemNum- 0) - itemNum;
    if(item.itemNum == 0) {
        delete this.items[index];
    }
    this.save();
    return item;
}

Package.prototype.hasItem = function(_item) {
	var flag = [];
	var num = _item.itemNum;
	for(var i = packageStart, l= this.itemCount+packageStart; i < l; i++ ) {
		if( this.items[i] && this.itesm[i].itemId == _item.itemId){
			var item = this.items[i];
			if(num > item.itemNum){
				num = num - item.itemNum;
				flag.push(item);
			}else{
				flag.push({
					itemId: item.itemId,
					itemNum: num,
					level: item.level
				});
				num = 0;
			}			
			if(num == 0) {
				return flag;
			}
		}
	}
	return null;
}

Package.prototype.addItemWithNoType = function(player, item) {
	var type = "";
    if(item.itemId.indexOf("W") >= 0) {
        type = PackageType.WEAPONS;
    } else if(item.itemId.indexOf("E") >= 0) {
        type = PackageType.EQUIPMENTS;
    } else {
        type = PackageType.ITEMS;
    }
    return this.addItem(player, type, item);
}


Package.prototype.arrange = function(callback) {
    var items = this.items;
    var Cs = []
        , Es = []
        , Ws = []
        , Ds = []
        , Ts = [];
    for(var i = packageStart,l=this.itemCount + packageStart; i < l ;i++) {
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
            }
        }
    }
    var sortFun = function(a, b) {
        if(a.itemId > b.itemId) {
            return 1;
        } else if(a.itemId < b.itemId ){
            return -1;
        } else {
            if(a.level == b.level) {
                if( (a.substring(0,1) == "C" || a.substring(0,1) == "D" ) ){
                var all =  a.itemNum+b.itemNum;
                if(all>99){
                    a.itemNum = 99;
                    b.itemNum = all-99;
                }else{
                    a.itemNum = all;
                    b.itemNum = 0;
                }
                return 0;
                }else{  
                    return 0;
                }
            }else{
                if(a.level > b.level){
                    return 1;
                }else{
                    return -1;
                }
            }
            
        }
    };
    Cs.sort(sortFun);Es.sort(sortFun);Ws.sort(sortFun); Ds.sort(sortFun);Ts.sort(sortFun);
    var all = [];
    all = all.concat(Cs, Es, Ws, Ds, Ts);

    var json = arrayToJson(all);
    console.log(json);
    this.items = json;
    this.save();
    callback(null, {itemCount:this.itemCount, items: json});
}

var arrayToJson = function(array) {
    var json = {};
    var n = packageStart;
    for(var i=0,l = array.length;i < l;i++){
        if(array[i] && array[i].itemNum != 0){
            json[n] = array[i];
            n++;
        }       
    }
    return json;
} 


Package.prototype.addItem = function(player , type, item, rIndex) {
    var changes = [];
    var _items = utils.clone(item);
    if (!item || !item.itemId || !item.itemId.match(/W|E|D/)) {
        //返回{}并没有返回null 容易判断
        return null;
    }
    if(rIndex) {
        if(this.items[rIndex]) {
            delete this.items[rIndex];
        }
    }
    var items = this;
    if(type == PackageType.WEAPONS || type == PackageType.EQUIPMENTS) {
        for (var i = packageStart; i < items.itemCount+packageStart; i++) {
            if (!items.items[i]) {
                console.log("item:",item);
                items.items[i] = {
                    itemId: item.itemId,
                    itemNum: item.itemNum,
                    level: item.level
                };
                changes = [{
                    index: i,
                    item: items.items[i]
                }];

                break;
            }
        }
    }else{

         for(var i in items.items) {
            if(items.items[i].itemId == item.itemId && items.items[i].itemNum < 99) {

                _items.itemNum += this.items[i].itemNum;
                var mitem = items.items[i];
                if(parseInt(mitem.itemNum) + parseInt(item.itemNum) > 99 ) {
                    item.itemNum =parseInt(item.itemNum) + parseInt(mitem.itemNum) - 99;
                    mitem.itemNum = 99;
                    changes.push({
                        index: i,
                        item: mitem
                    });

                } else if(parseInt(mitem.itemNum) + parseInt(item.itemNum) <= 99) {

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
                if(item.itemNum > 99) {
                    // 一定小于99个所以直接添加就好了，传入数值最大99
                    items.items[spaceCount] = {
                        itemId: item.itemId,
                        itemNum: 99,
                        level: item.level
                    };
                    changes.push({
                        index: spaceCount,
                        item: items.items[spaceCount]
                    });
                    item.itemNum -= 99;

                    return run();
                }
                console.log(item.itemNum);
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
            }else{
                return {index: changes}
            }
            
        }
            if(!run()){
            	return null;
            }
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