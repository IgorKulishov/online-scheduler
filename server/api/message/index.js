'use strict';

var express = require('express');
var app = express();
var websockets = require('./ws');
var router = express.Router();

module.exports = function(server) {
	websockets.connect(server);
	//console.log('Web server listening on %d, in %s mode', config.port, app.get('env'));
	console.log('Web server listening..');
};