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
    , battle = require('./routes/battle')
    , casino = require('./routes/casino')
    , equip = require('./routes/equip')
    , formation = require('./routes/formation')
    , friend = require('./routes/friend')
    , guide = require('./routes/guide')
    , indu = require('./routes/indu')
    , mail = require('./routes/mail')
    , package = require('./routes/package')
    , player = require('./routes/player')
    , resource = require('./routes/resource')
    , shop = require('./routes/shop')
    , skill = require('./routes/skill')
    , task = require('./routes/task')
    , gm = require('./routes/gm')
    , message = require('./routes/message')
    , authRequired = require('./middlewares/auth_required');
    

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

    // 竞技场
    app.get('/arena/pk', authRequired, arena.pk);
    app.get('/arena/add', authRequired, arena.add);
    app.get('/arena/getOpponents', authRequired, arena.getOpponents);
    app.get('/arena/getRank', authRequired, arena.getRank);
    app.get('/arena/enterArena', authRequired, arena.enterArena);
    app.get('/arena/getPKData', authRequired, arena.getPKData);

    //战斗
    app.get('/battle/battle', authRequired, battle.battle);
    app.get('/battle/battle2', battle.battle2);

    //赌场
    app.get('/casino/getItems', authRequired, casino.getItems);
    app.get('/casino/gambling', authRequired, casino.gambling);

    app.get('/equip/wearWeapon', authRequired, equip.wearWeapon);
    app.get('/equip/unWearWeapon', authRequired, equip.unWearWeapon);
    app.get('/equip/equip', authRequired, equip.equip);
    app.get('/equip/unEquip', authRequired, equip.unEquip);
    app.get('/equip/upgrade', authRequired, equip.upgrade);

    app.get('/formation/change', authRequired, formation.change);

    app.get('/friend/get', authRequired, friend.get);
    app.get('/friend/add', authRequired, friend.add);
    app.get('/friend/addByName', authRequired, friend.addByName);
    app.get('/friend/remove', authRequired, friend.remove);

    app.get('/guide/get', authRequired, guide.get);
    app.get('/guide/save', authRequired, guide.save);

    app.get('/indu/triggerEvent', authRequired, indu.triggerEvent);

    app.get("/mail/getIn", authRequired, mail.getIn);
    app.get("/mail/getOut", authRequired, mail.getOut);
    app.get("/mail/send", authRequired, mail.send);
    app.get("/mail/read", authRequired, mail.read);
    app.get("/mail/collectItem", authRequired, mail.collectItem);
    app.get("/mail/del", authRequired, mail.del);
    app.get("/mail/collectMail", authRequired, mail.collectMail);
    app.get("/mail/_Add", authRequired, mail._Add);
    app.get("/mail/_Set", authRequired, mail._Set);

    

    app.get("/package/_Set", authRequired, package._Set);
    app.get('/package/_AddItem', authRequired, package.addItem);
    app.get("/package/arrange", authRequired, package.arrange );
    app.get('/package/moveItem', authRequired, package.resetItem);
    app.get('/package/throwItem', authRequired, package.discardItem);

    app.get('/package/sellItem', authRequired, package.sellItem);
    
    app.get('/package/userItem', authRequired, package.userItem);

    app.get('/player/enterScene', authRequired, player.enterScene);
    app.get('/player/changeAndGetSceneData', authRequired, player.changeAndGetSceneData);
    app.get('/player/enterIndu', authRequired, player.enterIndu);
    app.get('/player/leaveIndu', authRequired, player.leaveIndu);
    app.get('/player/getPartner', authRequired, player.getPartner);
    app.get('/player/changeView', authRequired, player.changeView);
    app.get('/player/changeArea', authRequired, player.changeArea);
    app.get('/player/npcTalk', authRequired, player.npcTalk);
    app.get('/player/learnSkill', authRequired, player.learnSkill);
    app.get('/player/upgradeSkill', authRequired, player.upgradeSkill);
    app.get('/player/useSkill', authRequired, player.useSkill);
    app.get('/player/forgetSkill', authRequired, player.forgetSkill);

    app.get('/resource/loadResource', authRequired, resource.loadResource);

    app.get('/shop/buyItem', authRequired, shop.buyItem);

    app.get('/skill/initSkill', authRequired, skill.initSkill);

    app.get('/task/startTask', authRequired, task.startTask);
    app.get('/task/handOverTask', authRequired, task.handOverTask);

    app.get('/gm/resetTask', gm.resetTask);
    app.get('/gm/updateMoney', gm.updateMoney);
    app.get('/gm/updateExp', gm.updateExp);

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

}