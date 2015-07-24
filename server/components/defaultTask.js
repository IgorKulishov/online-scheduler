'use strict'

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mops_db', function() {
    console.log('connected to database for default templates');
});

var defaultTask = mongoose.Schema({
    "username": String,
    "day": Number,
    "month": Number,
    "year": Number,
    "task": String,
    "start": Number,
    "finish": Number,
    "existName": Boolean
});

module.exports = mongoose.model('DefaultTask', defaultTask);