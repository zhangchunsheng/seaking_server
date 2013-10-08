/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-08
 * Description: packageUtil
 */
var packageUtil = module.exports;

packageUtil.initPackage = function(heroId) {
    var itemId = "";
    if(parseInt(heroId) < 10) {
        heroId = "0" + heroId;
    }
    itemId = "W" + heroId + "01";
    var package = {
        weapons: {
            itemCount: 12,
            items: {"1":{
                "itemId":itemId,
                "itemNum":1,
                "level":1
            }}
        },
        equipments: {
            itemCount: 12,
            items: {"1":{
                "itemId":"W90101",
                "itemNum":1,
                "level":1
            }}
        },
        items: {
            itemCount: 12,
            items: {"1":{"itemId":"D10010101","itemNum":1}}
        }
    };
    return package;
}