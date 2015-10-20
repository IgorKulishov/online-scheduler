'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
    "name": String,
    "info": String,
    "active": Boolean,
    "username": String,
    "day": Number,
    "month": Number,
    "year": Number,
    "task": String,
    "taskDescription": String,
    "start": String,
    "finish": String,
    "existName": Boolean
});

module.exports = mongoose.model('Schedule', ScheduleSchema);