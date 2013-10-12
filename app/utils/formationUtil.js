/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-12
 * Description: formationUtil
 */
var utils = require('./utils');

var formationUtil = module.exports;

formationUtil.calculateAroundOneCell = function(fId) {
    var array = [];
    if(fId == 0) {
        array = [1,2,3,4,5,6];
    } else if(fId == 1) {
        array = [0,2,6];
    } else if(fId == 2) {
        array = [0,1,3];
    } else if(fId == 3) {
        array = [0,2,4];
    } else if(fId == 4) {
        array = [0,3,5];
    } else if(fId == 5) {
        array = [0,4,6];
    } else if(fId == 6) {
        array = [0,1,5];
    } else {
        var num = 0;
        array.push(num);
        num = fId - 1;
        if(num == 0)
            num = 6;
        array.push(num);
        num = fId + 1;
        if(num == 7)
            num = 1;
        array.push(num);
    }
}

/**
 * 获得随机目标
 * @param num
 * @param positions
 */
formationUtil.getRandomPosition = function(num, positions) {
    var array = [];

    if(num >= positions.length) {
        array = positions;
    } else {
        getRandom(array, num, positions.length);
        for(var i = 0 ; i < array.length ; i++) {
            array[i] = positions[array[i]];
        }
    }
    return array;
}

function getRandom(array, num, count) {
    if(array.length == num)
        return;
    var random = utils.random(0, count - 1);
    for(var i = 0 ; i < array.length ; i++) {
        if(random == array[i]) {
            getRandom(array, num, count);
        }
    }
    array.push(random);
    if(array.length <= num)
        getRandom(array, num, count);
}