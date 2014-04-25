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

zabbix.templateid = "10084";

zabbix.login("api", "Keikie0t");

zabbix.getItems = function(user) {

    var user = user || zabbix.user;
    var data = {
        "jsonrpc": "2.0",
        "method": "item.getobjects",
        "params": {
            "host": "Zabbix server"
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
            return item.name.indexOf("avg.curl") === 0;
        });
        console.log(zabbix.items);

        var itemsTable = $("#itemsbody");
        _.each(zabbix.items, function(item, index) {
            console.log("item ITEEEEEM", item);  
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
    });

};

zabbix.addEntry = function(url) {
    var user = zabbix.user;

    var key = ['grpavg["zenping","curl.httptime['+url+']",last,0]', 'curl.httptime['+url+']'];
    var name = ["avg.curl.httptime["+url+"]", "httptime:"+url];
    var applications = ["503", "502"];
    var type = [8, 7];
    var hostid = ["10084", "10108"];

    var data = {
        "jsonrpc": "2.0",
        "method": "item.create",
        "params": {
            "key_": key[0],
            "name": name[0],
            "hostid": hostid[0],
            "type":type[0],
            "value_type": 0,
            "interfaceid": "",
            "applications": [applications[0]],
            "delay" : 10
        },
        "id": 1,
        "auth": user.sessionid
    };

    var dataCheck = {
        "jsonrpc": "2.0",
        "method": "item.create",
        "params": {
            "key_": key[1],
            "name": name[1],
            "hostid": hostid[1],
            "type":type[1],
            "value_type": 0,
            "interfaceid": "",
            "applications": [applications[1]],
            "delay" : 10
        },
        "id": 1,
        "auth": user.sessionid
    };

    $.ajax({
      type: "POST",
      url: zabbix.endpoint,
      data: JSON.stringify(dataCheck),
      contentType:"application/json; charset=utf-8"
    }).done(function( result ) {
        $.ajax({
          type: "POST",
          url: zabbix.endpoint,
          data: JSON.stringify(data),
          contentType:"application/json; charset=utf-8"
        }).done(function( result ) {
           window.location = "/";  
        });
    });

//     {"jsonrpc":"2.0","error":{"code":-32602,"message":"Invalid params.","data":"Application with ID \"502\" is not available on \"Zabbix server\"."},"id":1}nse@nizars-mbp-2: /Applications
// $ curl -i -X POST -H 'Content-Type:application/json' -d'{"jsonrpc": "2.0","method":"item.create","params":{"key_":"grpavg[\"zenping\",\"curl.httptime[https://prismic.io/]\",last,0]","name":"avg.curl.httptime[https://prismic.io/]", "hostid": "10084", "type":7, "value_type": 0, "interfaceid": "", "applications": ["503"], "delay" : 30  }, "id":1, "auth": "cd193ca9d5d453e5179a9c74a0e07bdd"}' http://zabbix.0x50.net/zabbix/api_jsonrpc.php
}

var addEntryBtn = $("#addEntryBtn");

addEntryBtn.on("click", function() {
    var url = $("#entryURL").val();
    zabbix.addEntry(url);
});