$(document).ready(function() {
    $("#register_submit").click(function(e) {
        var loginName = $("#loginName").val();
        var password = hex_md5($("#password").val());

        $.ajax({
            type: "post",
            url: "/register",
            data: {
                loginName: loginName,
                password: password
            },
            success: function(result, status) {
                console.log(result);
            }
        });
    });

    $("#login_submit").click(function(e) {
        var loginName = $("#loginName").val();
        var password = hex_md5($("#password").val());

        $.ajax({
            type: "post",
            url: "/login",
            data: {
                loginName: loginName,
                password: password
            },
            success: function(result, status) {
                console.log(result);
            }
        });
    });
});