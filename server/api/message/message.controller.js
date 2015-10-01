'use strict';

var express = require('express');
var app = express();
var websockets = require('./ws');
var router = express.Router();

router.get('/:username/:taskDescription', function(req, res) {
	var params = req.params;
	console.log(params.username + ' : ' + params.taskDescription);
 	websockets.broadcast(params);
	//res.json(201, params);
});

module.exports = router;