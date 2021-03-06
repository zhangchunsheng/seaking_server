/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-24
 * Description: routes
 */
var routes = require('./routes')
    , auth = require('./routes/auth')
    , role = require('./routes/role')
    , area = require('./routes/area')
    , arena = require('./routes/arena')
    , casino = require('./routes/casino')
    , equip = require('./routes/equip')
    , formation = require('./routes/formation')
    , friend = require('./routes/friend')
    , guide = require('./routes/guide')
    , mail = require('./routes/mail')
    , package = require('./routes/package')
    , player = require('./routes/player')
    , partner = require('./routes/partner')
    , aptitude = require('./routes/character/aptitude')
    , ghost = require('./routes/character/ghost')
    , misc = require('./routes/character/misc')
    , altar = require('./routes/character/altar')
    , soul = require('./routes/character/soul')
    , resource = require('./routes/resource')
    , shop = require('./routes/shop')
    , skill = require('./routes/skill')
    , task = require('./routes/_task')
    , gm = require('./routes/gm')
    , message = require('./routes/message')
    , authRequired = require('./middlewares/auth_required')
    , astrology = require("./routes/astrology")
    , clifford = require("./routes/clifford")
    , pet = require("./routes/pet")
    , _battle = require("./routes/_battle")
    , gameEvent = require("./routes/gameEvent")
    , duplicate = require("./routes/duplicate");

module.exports = function (app) {
    app.get('/', authRequired, routes.index);
    app.get('/index', authRequired, routes.index);

    app.get('/auth', auth.auth);

    app.get('/role/createMainPlayer', authRequired, role.createMainPlayer);
    app.get('/role/getMainPlayer', authRequired, role.getMainPlayer);
    app.get('/role/initNickname', authRequired, role.initNickname);
    app.get('/role/getNickname', authRequired, role.getNickname);
    app.get('/role/removeMainPlayer', authRequired, role.removeMainPlayer);
    app.get('/role/testCreateMainPlayer', role.testCreateMainPlayer);

    app.get('/area/getAreaInfo', area.getAreaInfo);
    app.get('/area/getAreaPlayers', area.getAreaPlayers);
    app.get('/area/getSceneData', area.getSceneData);

    // 竞技场
    app.get('/arena/pk', authRequired, arena.pk);
    app.get('/arena/add', authRequired, arena.add);
    app.get('/arena/getOpponents', authRequired, arena.getOpponents);
    app.get('/arena/getRank', authRequired, arena.getRank);
    app.get('/arena/enterArena', authRequired, arena.enterArena);
    app.get('/arena/getPKData', authRequired, arena.getPKData);

    //战斗
    app.get("/battle/battle3", authRequired,_battle.battle3);

    //赌场
    app.get('/casino/get', authRequired, casino.get);
    app.get('/casino/refresh', authRequired, casino.refresh);
    app.get('/casino/gambling', authRequired, casino.gambling);
    app.get("/casino/gmRepair", authRequired, casino.gmRepair);

    app.get("/clifford/do", authRequired, clifford.do);
    app.get("/clifford/test", authRequired, clifford.test);
    app.get("/clifford/gmAdd", authRequired, clifford.gmAdd);

    //装备
    app.get('/equip/wearWeapon', authRequired, equip.wearWeapon);
    app.get('/equip/unWearWeapon', authRequired, equip.unWearWeapon);
    app.get('/equip/equip', authRequired, equip.equip);
    app.get('/equip/unEquip', authRequired, equip.unEquip);
    app.get('/equip/upgrade', authRequired, equip.upgrade);
    app.get('/equip/forgeUpgrade', authRequired, equip.forgeUpgrade);
    app.get('/equip/inlay', authRequired, equip.inlay);
    app.get('/equip/unInlay', authRequired, equip.unInlay);
    app.get('/equip/changeDiamond', authRequired, equip.changeDiamond);

    app.get('/formation/change', authRequired, formation.change);
    app.get('/formation/setDefault', authRequired, formation.setDefault);
    app.get('/formation/save', authRequired, formation.setDefault);
    app.get('/formation/resetFormation', authRequired, formation.resetFormation);
    app.get('/formation/forteAttack', authRequired, formation.forteAttack);
    app.get('/formation/forteDefense', authRequired, formation.forteDefense);
    app.get('/formation/setTactical', authRequired, formation.setTactical);
    app.get('/formation/upgradeTactical', authRequired, formation.upgradeTactical);
    app.get('/formation/unlock', authRequired, formation.unlock);

    app.get('/friend/get', authRequired, friend.get);
    app.get('/friend/add', authRequired, friend.add);
    app.get('/friend/addByName', authRequired, friend.addByName);
    app.get('/friend/remove', authRequired, friend.remove);


    app.get('/guide/get', authRequired, guide.get);
    app.get('/guide/save', authRequired, guide.save);

    app.get("/duplicate/start", authRequired, duplicate.start);
    app.get("/duplicate/trigger", authRequired, duplicate.trigger);
    app.get("/duplicate/get", authRequired, duplicate.get);

    app.get("/mail/getIn", authRequired, mail.getIn);
    app.get("/mail/getOut", authRequired, mail.getOut);
    app.get("/mail/send", authRequired, mail.send);
    app.get("/mail/read", authRequired, mail.read);
    app.get("/mail/collectItem", authRequired, mail.collectItem);
    app.get("/mail/del", authRequired, mail.del);
    app.get("/mail/collectMail", authRequired, mail.collectMail);
    app.get("/mail/_Add", authRequired, mail._Add);
    app.get("/mail/_Set", authRequired, mail._Set);

    app.get("/astrology/main", authRequired, astrology.main);
    app.get("/astrology/summon", authRequired, astrology.random);
    app.get("/astrology/summonTo3", authRequired, astrology.buy);
    app.get("/astrology/sellAllCi", authRequired, astrology.sell);
    app.get("/astrology/equip", authRequired, astrology.load);
    app.get("/astrology/unEquip", authRequired, astrology.unLoad);
    app.get("/astrology/test", authRequired, astrology.test);
    app.get("/astrology/cos", authRequired, astrology.pickUp);
    app.get("/astrology/unlock", authRequired, astrology.unlock);
    app.get("/astrology/collectAllCi", authRequired, astrology.pickUpAll);
    app.get("/astrology/convert", authRequired, astrology.exchange);
    app.get("/astrology/synthAllBi", authRequired, astrology.merger);
    app.get("/astrology/synth", authRequired, astrology.onceMerger);
    app.get("/astrology/synth2", authRequired, astrology.onceMerger2);
    app.get("/astrology/gmRepair", authRequired, astrology.gmRepair);

    app.get('/package/_AddItem', authRequired, package.addItem);
    app.get("/package/arrange", authRequired, package.arrange);
    app.get('/package/moveItem', authRequired, package.resetItem);
    app.get('/package/throwItem', authRequired, package.discardItem);
    app.get('/package/sellItem', authRequired, package.sellItem);
    app.get('/package/userItem', authRequired, package.userItem);
    app.get("/package/unlock", authRequired, package.unlock);
    
    app.get("/package/gmClean", authRequired, package.clean);

    app.get('/player/enterScene', authRequired, player.enterScene);
    app.get('/player/changeAndGetSceneData', authRequired, player.changeAndGetSceneData);
    app.get('/player/enterIndu', authRequired, player.enterIndu);
    app.get('/player/leaveIndu', authRequired, player.leaveIndu);
    app.get('/player/getPartner', authRequired, partner.getPartner);
    app.get('/player/changeView', authRequired, player.changeView);
    app.get('/player/changeArea', authRequired, player.changeArea);
    app.get('/player/npcTalk', authRequired, player.npcTalk);
    app.get('/player/getPlayerInfo', authRequired, player.getPlayerInfo);

    //技能
    app.get('/player/learnSkill', authRequired, skill.learnSkill);
    app.get('/player/upgradeSkill', authRequired, skill.upgradeSkill);
    app.get('/player/useSkill', authRequired, skill.useSkill);
    app.get('/player/forgetSkill', authRequired, skill.forgetSkill);
    app.get('/skill/learnSkill', authRequired, skill.learnSkill);
    app.get('/skill/upgradeSkill', authRequired, skill.upgradeSkill);
    app.get('/skill/useSkill', authRequired, skill.useSkill);
    app.get('/skill/forgetSkill', authRequired, skill.forgetSkill);
    app.get('/skill/getAllSkill', authRequired, skill.getAllSkill);
    app.get('/skill/learnAndUpgradeSkill', authRequired, skill.learnAndUpgradeSkill);

    app.get('/partner/getPartner', authRequired, partner.getPartner);
    app.get('/partner/gotoStage', authRequired, partner.gotoStage);
    app.get('/partner/leaveTeam', authRequired, partner.leaveTeam);

    app.get('/aptitude/upgrade', authRequired, aptitude.upgrade);
    app.get('/aptitude/checkFreeTime', authRequired, aptitude.checkFreeTime);
    app.get('/aptitude/checkAllFreeTime', authRequired, aptitude.checkAllFreeTime);
    app.get('/ghost/upgrade', authRequired, ghost.upgrade);

    app.get('/misc/getMiscs', authRequired, misc.getMiscs);
    app.get('/altar/extraction', authRequired, altar.extraction);
    app.get('/altar/exchange', authRequired, altar.exchange);
    app.get('/soul/fusion', authRequired, soul.fusionWithPackageIndex);
    app.get('/soul/fusionWithHeroId', authRequired, soul.fusion);

    app.get('/resource/loadResource', authRequired, resource.loadResource);

    app.get('/shop/buyItem', authRequired, shop.buyItem);

    app.get('/skill/initSkill', authRequired, skill.initSkill);

    //app.get('/task/startTask', authRequired, task.startTask);
    //app.get('/task/handOverTask', authRequired, task.handOverTask);
    app.get("/task/startTask", authRequired, task.startTask);
    app.get("/task/endTask", authRequired, task.endTask);
    app.get("/task/gmGetTask", authRequired, task.gmGetTask);
    app.get("/task/gmAddTask", authRequired, task.gmAddTask);

    app.get("/event/trigger", authRequired, gameEvent.trigger);

    app.get('/gm/resetTask', gm.resetTask);
    app.get('/gm/updateMoney', gm.updateMoney);
    app.get('/gm/updateGold', gm.updateGold);
    app.get('/gm/updateExp', gm.updateExp);
    app.get("/gm/clearPackage", gm.clearPackage);
    app.get("/gm/initTasks", gm.initTasks);

    app.get('/message/addMessage', authRequired, message.addMessage);
    app.get('/message/getMessage', authRequired, message.getMessage);
    app.get('/message/removeMessage', authRequired, message.removeMessage);
    app.get('/message/addTipMessage', authRequired, message.addTipMessage);
    app.get('/message/getTipMessage', authRequired, message.getTipMessage);
    app.get('/message/removeTipMessage', authRequired, message.removeTipMessage);
    app.get('/message/addBattleReport', authRequired, message.addBattleReport);
    app.get('/message/getBattleReport', authRequired, message.getBattleReport);
    app.get('/message/removeBattleReport', authRequired, message.removeBattleReport);
    app.get('/message/publishMessage', message.publishMessage);

    app.get("/pet/gmUpgrade", authRequired, pet.gmUpgrade);
    app.get("/pet/gmAdd", authRequired, pet.gmAdd);
    app.get("/pet/gmAddUpgradeItem", authRequired, pet.gmAddUpgradeItem);
    app.get("/pet/gmAddUpgradeItem2", authRequired, pet.gmAddUpgradeItem2);
    app.get("/pet/gmAddFeedItem", authRequired, pet.gmAddFeedItem);
    app.get("/pet/setName", authRequired, pet.setName);
    app.get("/pet/upgradeSkill", authRequired, pet.upgradeSkill);
    app.get("/pet/play", authRequired, pet.play);
    app.get("/pet/feed", authRequired, pet.feed);
    app.get("/pet/usePet", authRequired, pet.usePet);
    app.get("/pet/release", authRequired, pet.release);
    app.get("/pet/update", authRequired, pet.update);
}