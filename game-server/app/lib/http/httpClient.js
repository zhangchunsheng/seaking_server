/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-09-05
 * Description: httpClient
 */
var httpClient = module.exports;

/**
 *
 * @param type get|post
 * @param header
 * @param params
 * @param post_body
 */
httpClient.request = function(type, header, params, post_body) {

}

/**
 *
 * @param header
 * @param params
 * @param post_body
 */
httpClient.get = function(header, params, post_body) {
    var type = "get";
    httpClient.request(type, header, params, post_body);
}

/**
 *
 * @param header
 * @param params
 * @param post_body
 */
httpClient.post = function(header, params, post_body) {
    var type = "post";
    httpClient.request(type, header, params, post_body);
}