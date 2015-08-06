'use strict'

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mops_db', function() {
    console.log('connected to database');
});

var newUser = mongoose.Schema({
    "first_name": String,
    "last_name": String,
    "username": String,
    "password": String, //hidden and not sendable to client
    "Phone": Number,
    "e_mail": String,
    "position": String,
    //AVAILABILITY:
    "monday_from": Number,
    "monday_to": Number,
    "tuesday_from": Number,
    "tuesday_to": Number,
    "wednesday_from": Number,
    "wednesday_to": Number,
    "thursday_from": Number,
    "thursday_to": Number,
    "friday_from": Number,
    "friday_to": Number,
    "saturday_from": Number,
    "saturday_to": Number,
    "sunday_from": Number,
    "sunday_to": Number,
    //assignable TASKS:
    "task_one":String,
    "task_two":String,
    "task_three":String
});
console.log('new user model is loaded');
module.exports = mongoose.model('NewUser', newUser);