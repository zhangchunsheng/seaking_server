/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-10-17
 * Description: testUtils
 */
var should = require('should');
var utils = require('../../app/utils/utils');
var playerUtil = require('../../app/utils/playerUtil');
var formationUtil = require('../../app/utils/formationUtil');

describe('utils test', function() {
    it('random', function() {
        console.log(utils.random(0, 1));
    });

    it('getRandomPosition', function() {
        var array = [];
        var positions = [1,3,5,7,9,11];
        var num = 3;

        console.log(formationUtil.getRandomPosition(num, positions));

        var heroId = "H1201";
        heroId = heroId.substr(0, 2) + 0 + heroId.substr(3);
        console.log(heroId);

        console.log(playerUtil.initAptitude(1));
        console.log(JSON.parse(playerUtil.initAptitude(1, "string")));
    });

    it('fightData', function() {
        /*var fightData = [];

        var fight = {};
        fight.id = 1;
        fightData.push(fight);

        fight.id = 2;
        fightData.push(fight);

        console.log(fightData);*/
    });
});