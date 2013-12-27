/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-22
 * Description: skill
 */
var playerService = require('../app/services/playerService');
var userService = require('../app/services/userService');
var skillService = require('../app/services/skillService');
var partnerService = require('../app/services/partnerService');
var packageService = require('../app/services/packageService');
var equipmentsService = require('../app/services/equipmentsService');
var taskService = require('../app/services/taskService');
var Code = require('../shared/code');
var utils = require('../app/utils/utils');
var partnerUtil = require('../app/utils/partnerUtil');
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
 * initSkill
 * @param req
 * @param res
 */
exports.initSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var cId = msg.cId;
    skillService.initSkill();
    var data = {};
    data = {
        code: Code.SKILL.NO_SKILL
    };
    utils.send(msg, res, data);
}

/**
 * initSkill
 * @param req
 * @param res
 */
exports.initAllSkills = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName;

    var playerId = session.playerId;

    var array = [];
    skillService.initAllSkills(array, serverId, registerType, loginName, playerId, function() {
        var data = {};
        data = {
            code: Code.OK
        };
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
 * 学习升级技能
 * @param req
 * @param res
 */
exports.learnAndUpgradeSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , type = msg.type;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var data = {};
    if(isSelf) {
        if(playerId != session.playerId) {
            data = {
                code: Code.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }
    }

    var characterId = utils.getRealCharacterId(playerId);

    var skillId = msg.skillId;
    if(utils.empty(skillId)) {
        data = {
            code: Code.ARGUMENT_EXCEPTION
        };
        utils.send(msg, res, data);
        return;
    }

    var data = {};

    if(utils.empty(type) || type > 6 || type < 1) {
        data = {
            code: Code.SKILL.WRONG_TYPE
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var character;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        } else {
            character = player;
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        var currentSkills = character.currentSkills;
        if(typeof currentSkills[type] != "undefined") {
            if(currentSkills[type].skillId != 0 && currentSkills[type].skillId != skillId) {
                data = {
                    code: Code.ARGUMENT_EXCEPTION
                };
                utils.send(msg, res, data);
                return;
            }
        }

        var skill = dataApi.skillsV2.findById(skillId);
        if(utils.empty(skill)) {
            data = {
                code: Code.SKILL.NO_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        var upgradeSkillRequired = skill.upgradeSkillRequired;//D10030113|1
        var status = character.checkUpgradeSkillRequired(player, type, upgradeSkillRequired);
        if(status == 0) {
            data = {
                code: Code.SKILL.LACK_UPGRADEMATERIAL
            };
            utils.send(msg, res, data);
            return;
        }
        //packageInfo
        var packageInfo = status.packageInfo;
        var packageIndex = [];
        var item;
        for(var i = 0 ; i < packageInfo.length ; i++) {
            for(var j = 0 ; j < packageInfo[i].length ; j++) {
                item = player.packageEntity.removeItem(packageInfo[i][j].index, packageInfo[i][j].itemNum);
                packageIndex.push({
                    index: packageInfo[i][j].index,
                    itemId: item.itemId,
                    itemNum: item.itemNum
                });
            }
        }
        if(packageIndex.length == 0) {
            packageIndex = 0;
        }
        var money = status.money;
        player.money = player.money - money;
        character.learnAndUpgradeSkill(player, type, skillId, status, function(err, result) {
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
                    level: result,
                    packageIndex: packageIndex,
                    money: player.money
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

/**
 * 遗忘技能
 * @param req
 * @param res
 */
exports.forgetSkill = function(req, res) {
    var msg = req.query;
    var session = req.session;

    var uid = session.uid
        , serverId = session.serverId
        , registerType = session.registerType
        , loginName = session.loginName
        , type = msg.type;

    var playerId = "";
    var isSelf = true;

    playerId = msg.playerId;

    if(typeof playerId == "undefined" || playerId == "") {
        playerId = session.playerId;
    }

    if(playerId.indexOf("P") > 0) {
        isSelf = false;
    }

    var data = {};
    if(isSelf) {
        if(playerId != session.playerId) {
            data = {
                code: Code.ARGUMENT_EXCEPTION
            };
            utils.send(msg, res, data);
            return;
        }
    }
    var characterId = utils.getRealCharacterId(playerId);

    var skillId = msg.skillId;

    var data = {};

    if(utils.empty(type) || type > 6 || type < 1) {
        data = {
            code: Code.SKILL.WRONG_TYPE
        };
        utils.send(msg, res, data);
        return;
    }
    userService.getCharacterAllInfo(serverId, registerType, loginName, characterId, function(err, player) {
        var character;
        if(!isSelf) {
            character = partnerUtil.getPartner(playerId, player);
        } else {
            character = player;
        }

        if(character == null) {
            data = {
                code: Code.ENTRY.NO_CHARACTER
            };
            utils.send(msg, res, data);
            return;
        }

        var currentSkills = character.currentSkills;
        if(typeof currentSkills[type] == "undefined") {
            data = {
                code: Code.SKILL.NO_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        if(typeof currentSkills[type] != "undefined") {
            if(currentSkills[type].skillId != skillId) {
                data = {
                    code: Code.ARGUMENT_EXCEPTION
                };
                utils.send(msg, res, data);
                return;
            }
        }
        var skill = dataApi.skillsV2.findById(skillId);
        if(utils.empty(skill)) {
            data = {
                code: Code.SKILL.NO_SKILL
            };
            utils.send(msg, res, data);
            return;
        }
        var forgetSkillRequired = skill.forgetSkillRequired;//D10030113|1
        var status = character.checkForgetSkillRequired(player, type, forgetSkillRequired);
        if(status == 0) {
            data = {
                code: Code.SKILL.LACK_UPGRADEMATERIAL
            };
            utils.send(msg, res, data);
            return;
        }
        //packageInfo
        var packageInfo = status.packageInfo;
        var packageIndex = [];
        var item;
        for(var i = 0 ; i < packageInfo.length ; i++) {
            for(var j = 0 ; j < packageInfo[i].length ; j++) {
                item = player.packageEntity.removeItem(packageInfo[i][j].index, packageInfo[i][j].itemNum);
                packageIndex.push({
                    index: packageInfo[i][j].index,
                    itemId: item.itemId,
                    itemNum: item.itemNum
                });
            }
        }
        character.forgeSkill(player, type, skillId, function(err, result) {
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
                    skillId: 0,
                    level: 0,
                    packageIndex: packageIndex
                };
                utils.send(msg, res, data);
            });
        });
    });
}

/**
 * 获得所有技能
 * @param req
 * @param res
 */
exports.getAllSkill = function(req, res) {

}