/*
    Zabbix API
*/

var zabbix = {};

zabbix.endpoint = "http://zabbix.0x50.net/zabbix/api_jsonrpc.php";

zabbix.login = function (username, password) {
    var data = {
        "jsonrpc": "2.0",
        "method": "user.login",
        "params": {
            "user": username,
            "password": password,
            "userData": true
        },
        "id": 1
    };

    $.ajax({
      type: "POST",
      url: zabbix.endpoint,
      data: JSON.stringify(data),
      contentType:"application/json; charset=utf-8"
    }).done(function( user ) {
        zabbix.user = user.result;
        // var app = $("#app");
        // app.append("Welcome, " + zabbix.user.alias + " (sessionId: " + zabbix.user.sessionid + ")");
        console.log( "Data Saved: ", user);
    });
};

zabbix.login("api", "Keikie0t");