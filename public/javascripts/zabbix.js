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
        zabbix.items = zabbix.getItems(zabbix.user);

        console.log( "Data Saved: ", user);
    });
};

zabbix.getItems = function(user) {
    var data = {
        "jsonrpc": "2.0",
        "method": "item.getobjects",
        "params": {
            "host": "hackday-the-agent"
        },
        "id": 1,
        "auth": user.sessionid
    };

    $.ajax({
      type: "POST",
      url: zabbix.endpoint,
      data: JSON.stringify(data),
      contentType:"application/json; charset=utf-8"
    }).done(function( items ) {
        zabbix.items = _.filter(items.result, function(item) {
            return item.key_.indexOf("curl") === 0;
        });
        console.log(zabbix.items);

        var itemsTable = $("#items");

        _.each(zabbix.items, function(item) {
            itemsTable.append("<div>"+item.name+"</div><br />");
        });
    });
}

zabbix.login("api", "Keikie0t");