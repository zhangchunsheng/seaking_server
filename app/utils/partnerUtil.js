/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-09
 * Description: partnerUtil
 */
var partnerUtil = module.exports;

partnerUtil.getPartner = function(playerId, player) {
    var partners = player.partners;
    for(var i = 0 ; i < partners.length ; i++) {
        if(partners[i].id == playerId) {
            return partners[i];
        }
    }
    return null;
}