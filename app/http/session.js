/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-24
 * Description: session
 */
var Session = function() {

}

Session.prototype.getLoginName = function(req, res) {
    var loginName = req.session.loginName
    if(typeof loginName == "undefined") {
        loginName = "";
    }
    return  loginName;
}

Session.prototype.existsLoginName = function(req, res) {
    var loginName = this.getLoginName(req, res);
    if(loginName == "") {
        return false;
    }
    return true;
}

Session.prototype.setSession = function(req, res, data) {
    for(var i in data) {
        req.session[i] = data[i];
    }
    req.session.save();
}

Session.prototype.clearSession = function(req, res, next) {
    req.session.destroy(next);
}

module.exports = new Session();