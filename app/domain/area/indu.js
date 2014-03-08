/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-07-26
 * Description: indu
 */
var dataApi = require('../../utils/dataApi');
var PackageType = require('../../consts/consts').PackageType;
var consts = require('../../consts/consts');
var userDao = require('../../dao/userDao');

var indu = module.exports;

indu.triggerEvent = function(mainPlayer, eid, cb) {
    var indu_event = {};
    indu_event = dataApi.indu_event.findById(eid);
    if(indu_event.eventType == consts.EventType.GET) {// 奖励金钱、经验、物品
        var eventData = indu_event.eventData;
        for(var key in eventData) {
            var partners = mainPlayer.partners;
            if(key == "money") {
                mainPlayer.addMoney(eventData[key]);
            } else if(key == "experience") {
                mainPlayer.addExp(eventData[key]);
                for(var i = 0 ; i < partners.length ; i++) {
                    partners[i].addExp(eventData[key]);
                }
            } else if(key == "items") {
                var index = mainPlayer.packageEntity.addItemWithNoType(mainPlayer, eventData[key]);
            }
            // player.save();

            mainPlayer.updatePlayerAttribute(partners, cb);
        }
    }
}