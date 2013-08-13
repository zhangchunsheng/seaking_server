/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-06-27
 * Description: getSystemInfo
 */
var result = '1';
monitor.sysmonitor.getSysInfo(function(msg) {
    result = msg;
});