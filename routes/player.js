/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: player
 */
var playerService = require('../app/services/playerService');
var userService = require('../app/services/userService');
var partnerService = require('../app/services/partnerService');
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var consts = require('../app/consts/consts');
var EntityType = require('../app/consts/consts').EntityType;
var dataApi = require('../app/utils/dataApi');
var area = require('../app/domain/area/area');
var world = require('../app/domain/world');
var async = require('async');

exports.index = function(req, res) {
    res.send("index");
}

/**
 * 进入场景
 * @param req
 * @param res
 */
exports.enterScene = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var data = {};

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        if (err || !player) {
            console.log('Get user for userDao failed! ' + err.stack);
            data = {
                code: consts.MESSAGE.ERR
            };
            utils.send(msg, res, data);

            return;
        }

        player.x = 100;
        player.y = 100;

        area.getAreaInfo(player, function(err, results) {
            area.addEntity(player, function(err, reply) {
                var data = {
                    code: consts.MESSAGE.RES,
                    entities: results
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 *
 * @param req
 * @param res
 */
exports.changeAndGetSceneData = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var areaId = msg.currentScene;
    var target = msg.target;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        if(err || !player) {
            console.log('Get user for userDao failed! ' + err.stack);
            data = {
                code: consts.MESSAGE.ERR
            };
            utils.send(msg, res, data);

            return;
        }

        if(areaId != player.currentScene) {
            data = {
                code: Code.AREA.WRONG_CURRENTSCENE
            };
            utils.send(msg, res, data);

            return;
        }

        area.getAreaInfo(player, function(err, results) {
            if (err) {
                data = {
                    code: consts.MESSAGE.ERR
                };
                utils.send(msg, res, data);

                return;
            }

            areaId = player.currentScene;
            if(areaId == target || target == "") {
                data = {
                    code: consts.MESSAGE.RES,
                    currentScene: areaId,
                    entities: results
                };
                utils.send(msg, res, data);
            } else {
                player.x = 100;
                player.y = 100;
                player.currentScene = target;
                world.removeAndUpdatePlayer(areaId, player, function(err) {
                    if(err) {
                        data = {
                            code: consts.MESSAGE.RES,
                            currentScene: areaId,
                            entities: results
                        };
                    } else {
                        data = {
                            code: consts.MESSAGE.RES,
                            currentScene: target,
                            entities: results
                        };
                    }
                    utils.send(msg, res, data);
                });
            }
        });
    });
}

/**
 * 进入副本
 * @param req
 * @param res
 */
exports.enterIndu = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , induId = msg.induId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.isEnterIndu = 1;

        var data = {};
        userService.enterIndu(serverId, registerType, loginName, induId, function(err, induInfo) {
            player.currentIndu = induInfo;
            data = {
                code: consts.MESSAGE.RES,
                induInfo: induInfo
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 离开副本
 * @param req
 * @param res
 */
exports.leaveIndu = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , induId = msg.induId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.isEnterIndu = 0;
        userService.leaveIndu(serverId, registerType, loginName, induId, function(err, induInfo) {
            player.currentIndu = induInfo;

            var data = {};
            player.updateTaskRecord(consts.TaskGoalType.PASS_INDU, {
                itemId: induId
            });

            data = {
                code: consts.MESSAGE.RES,
                induInfo: induInfo
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * 获得伙伴信息
 * @param req
 * @param res
 */
exports.getPartner = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , cId = msg.cId;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var partners = player.partners;
        var flag = false;
        for(var i = 0 ; i < partners.length ; i++) {
            if(partners[i].cId == cId) {
                flag = true;
                break;
            }
        }
        if(flag) {
            data = {
                code: 102
            };
            utils.send(msg, res, data);
            return;
        }
        partnerService.createPartner(serverId, uid, registerType, loginName, characterId, cId, function(err, partner) {
            if(err) {
                data = {
                    code: consts.MESSAGE.ERR
                };
                utils.send(msg, res, data);
                return;
            }

            player.partners.push(partner);

            data = {
                code: consts.MESSAGE.RES,
                partner: partner
            };
            utils.send(msg, res, data);
        });
    });
}

/**
 * changeView
 * @param req
 * @param res
 */
exports.changeView = function(req, res) {
    var msg = req.query;
    var session = req.session;

    res.send("changeView");
}

/**
 * 切换场景
 * @param req
 * @param res
 */
exports.changeArea = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var areaId = msg.currentScene;
    var target = msg.target;

    var args = {
        areaId: areaId,
        target: target,
        uid: session.uid,
        serverId: session.serverId,
        registerType: session.registerType,
        loginName: session.loginName,
        playerId: session.playerId
    };

    var data = {};
    world.changeArea(args, session, function(err) {
        if(err) {
            data = {
                code: consts.MESSAGE.ERR,
                currentScene: areaId
            };
            utils.send(msg, res, data);
        } else {
            data = {
                code: consts.MESSAGE.RES,
                currentScene: target
            };
            utils.send(msg, res, data);
        }
    });
}

/**
 * npcTalk
 * @param req
 * @param res
 */
exports.npcTalk = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        player.target = msg.targetId;
        utils.send(msg, res, data);
    });
}

/**
 * 学习技能
 * @param req
 * @param res
 */
exports.learnSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var skillId = msg.skillId;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = player.checkSkill(skillId);
        if(status == 0) {
            data = {
                code: Code.SKILL.HAVED_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        if(status == -1) {
            data = {
                code: Code.SKILL.NO_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        player.learnSkill(skillId, function(err, result) {
            if(err) {
                data = {
                    code:Code.SKILL.NEED_REQUIREMENT
                };
                utils.send(msg, res, data);
                return;
            }
            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(player.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                data = {
                    code: Code.OK,
                    skillId: skillId,
                    status: result
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 * 升级技能
 * @param req
 * @param res
 */
exports.upgradeSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var skillId = msg.skillId;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = player.checkSkillUpgrade(skillId);
        if(status == 0) {
            data = {
                code: Code.SKILL.NO_HAVE_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        if(status == -1) {
            data = {
                code: Code.SKILL.TOP_LEVEL
            };
            utils.send(msg, res, data);
            return;
        }
        if(status == -2) {
            data = {
                code: Code.SKILL.HAVED_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        if(status == -3) {
            data = {
                code: Code.SKILL.NO_REACH_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        player.upgradeSkill(msg.skillId, function(err, skillId) {
            if(err) {
                data = {
                    code:Code.SKILL.NEED_REQUIREMENT
                };
                utils.send(msg, res, data);
                return;
            }
            async.parallel([
                function(callback) {
                    userService.updatePlayerAttribute(player, callback);
                },
                function(callback) {
                    packageService.update(player.packageEntity.strip(), callback);
                },
                function(callback) {
                    equipmentsService.update(player.equipmentsEntity.strip(), callback);
                },
                function(callback) {
                    taskService.updateTask(player, player.curTasksEntity.strip(), callback);
                }
            ], function(err, reply) {
                data = {
                    skillId: skillId,
                    code:Code.OK
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 * 使用技能
 * @param req
 * @param res
 */
exports.useSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;
    var characterId = utils.getRealCharacterId(playerId);

    var skillId = msg.skillId;

    var data = {};
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var status = player.checkUseSkill(skillId);
        if(status == 1) {
            player.useSkill(msg.skillId, function(err, reply) {
                if(err) {
                    data = {
                        code:Code.SKILL.NO_SKILL
                    };
                    utils.send(msg, res, data);
                    return;
                }
                data = {
                    skillId: skillId,
                    code:Code.OK
                };
                utils.send(msg, res, data);
            });
        } else {
            data = {
                code: Code.SKILL.NO_SKILL
            };
            utils.send(msg, res, data);
        }
    });
}