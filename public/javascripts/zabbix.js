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

    var user = user || zabbix.user;
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
            return item.key_.indexOf("curl.httptime") === 0;
        });
        console.log(zabbix.items);

        var itemsTable = $("#itemsbody");
        _.each(zabbix.items, function(item, index) {            
            zabbix.getItemHistory(item, index);

            var statusIcon = (item.lastvalue < "400") ? "<i class='ui green checkmark icon'></i>" : "<i class='ui red attention icon'></i>"
            itemsTable.append("<tr><td>"+item.itemid+"</td><td>"+item.name+"</td><td>"+statusIcon+"</td><td><canvas id='graph"+item.itemid+"' height='100' ></canvas></td></tr>");
        });
    });
};

zabbix.getItemHistory = function(itemId, index) {
    var user =  zabbix.user;

    var data = {
        "jsonrpc": "2.0",
        "method": "history.get",
        "params": {
                "output": "extend",
                "history": 0,
                "itemids": itemId,
                "sortfield": "clock",
                "sortorder": "DESC",
                "limit": 10
            },
        "id": 1,
        "auth": user.sessionid
    };

    $.ajax({
      type: "POST",
      url: zabbix.endpoint,
      data: JSON.stringify(data),
      contentType:"application/json; charset=utf-8"
    }).done(function( history ) {
        zabbix.items[index].uphistory = history.result;
        var zabbixItem = zabbix.items[index];

        //Get the context of the canvas element we want to select
        var ctx = document.getElementById("graph"+zabbixItem.itemid).getContext("2d");
        var historyData = [];
        var historyLabel = [];
        _.each(zabbixItem.uphistory, function(h) {
            historyData.push(h.value*1000);
            historyLabel.push("");
        });

        var data = {
            labels : historyLabel,
            datasets : [
                {
                    fillColor : "rgba(220,220,220,0.5)",
                    strokeColor : "rgba(220,220,220,1)",
                    pointColor : "rgba(220,220,220,1)",
                    pointStrokeColor : "#fff",
                    data : historyData
                },
                {
                    fillColor : "rgba(151,187,205,0.5)",
                    strokeColor : "rgba(151,187,205,1)",
                    pointColor : "rgba(151,187,205,1)",
                    pointStrokeColor : "#fff",
                    data : historyData
                }
            ]
        }

        var myNewChart = new Chart(ctx).Line(data);

        console.log(zabbix.items[index].uphistory);
    });

};

zabbix.login("api", "Keikie0t");