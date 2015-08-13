'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TaskSchema = new Schema({
    "name": String,
    "info": String,
    "active": Boolean,
    "username": String,
    "day": Number,
    "month": Number,
    "year": Number,
    "task": String,
    "start": Number,
    "finish": Number,
    "existName": Boolean
});

module.exports = mongoose.model('Task', TaskSchema);