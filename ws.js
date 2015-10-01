var _ = require('lodash');
var ws = require('ws');
var clients = [];

exports.connect = function(server) {
	var wss = new ws.Server({"server" : server});
	wss.on('connection', function(ws) {
        ws.send('hello');
        clients.push(ws);
        exports.broadcast('ws message');
        ws.on('close', function() {
            _.remove(clients, ws);
        });
	});
}

exports.broadcast = function(data) {
    var json = JSON.stringify({data : data});
    clients.forEach(function (client) {
        client.send(json);
    });
}
