/*************************************
//
// scheduler app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var websockets = require('./ws');
var server = app.listen(3003, function() {
    console.log('Server is listening on', 3003);
});
require('./ws').connect(server);
app.use(express.static(__dirname + '/public'));
app.route('/:id')
    .get(function(req, res) {
    	var params = req.params.id;
	 	websockets.broadcast('new_post', params);
		res.json(201, params);
		console.log('posted');
    });