'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
//model with tasks
var newSchedTask = require('./server/components/newUserTask');
//model with new user
var newUserInfo = require('./server/components/newUserInfo');
//response for all errors including empty tasks, wrong dates, wrong formats
var errorMessage = require('./server/components/errorMessages');
//jwt key:
var jwtKey = 'online-scheduler';
//array of active tokens:
var tokenArray = [];

app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

//LOGIN & REGISTER NEW USER SERVER PART BEGINNING
//---------------------------------------

//add a new user
app.post('/rest/reg', function(req, res) {
    var newUserData = req.body;
    console.log(req.body.first_name);
    //newTaskUser to save to db mops_db:
    var newUserRecord = new newUserInfo({
        "first_name": newUserData.first_name,
        "last_name": newUserData.last_name,
        "username": newUserData.username,
        "password": newUserData.password, //hidden and not sendable to client
        "phone": newUserData.phone,
        "e_mail": newUserData.e_mail,
        "position": newUserData.position,
        "monday_from": newUserData.monday_from,
        "monday_to": newUserData.monday_to,
        "tuesday_from": newUserData.tuesday_from,
        "tuesday_to": newUserData.tuesday_to,
        "wednesday_from": newUserData.wednesday_from,
        "wednesday_to": newUserData.wednesday_to,
        "thursday_from": newUserData.thursday_from,
        "thursday_to": newUserData.thursday_to,
        "friday_from": newUserData.friday_from,
        "friday_to": newUserData.friday_to,
        "saturday_from": newUserData.saturday_from,
        "saturday_to": newUserData.saturday_to,
        "sunday_from": newUserData.sunday_from,
        "sunday_to": newUserData.sunday_to,
        "task_one": newUserData.task_one,
        "task_two": newUserData.task_two,
        "task_three": newUserData.task_three
    });
    //save data to DB a new User
    newUserRecord.save(function(err, newUserRecord) {
        if (err) { console.error(err); }
        console.log(newUserRecord);
        res.send(newUserRecord);
    });
});

app.get('/rest/users', function(req, res) {
    newUserInfo.find().sort('first_name').sort('last_name').exec(function(err, data) {
        if (err)
            console.log(err);
        console.log(data);
        res.send(data);
    });
});


app.delete('/rest/users/:id', function(req, res, next) {
    var deleteTaskId = req.params.id;
    //poll all data to find the 'id'
    //need to add functionality: 'find the _id first'
    newUserInfo.find(function(err, tasks) {
        if (err) { console.error(err); }
        newUserInfo.remove({'_id': deleteTaskId}, function(err, deleteTask) {
            if (err) { console.error(err); }
            console.log("Task with ID = " + deleteTaskId + " is deleted: " + deleteTask);
            res.send({"_id" : deleteTaskId});
        });
    });
});
//login into the application
app.post('/rest/auth', function(req, res, next) {
    var loginUser = req.body;
    var userName = loginUser.username;
    var passWord = loginUser.password;

    console.log(userName + ' : ' + passWord);
    newUserInfo.find({'username': userName, 'password': passWord}).exec(function(err, existUsers) {
        if (err) { console.error(err); }
        if (existUsers.length > 0) {
            var token = jwt.encode({'username' : userName}, jwtKey);
            tokenArray.push(token);
            console.log(token);
            res.send(token);
        }
    });
});
//logout and delete token from session 
app.put('/rest/logout', function(req, res, next) {    
    var logoutToken = req.headers['x-auth'];
    for (var i = 0; i < tokenArray.length; i++) {
        if (tokenArray[i] === logoutToken) {
            tokenArray.splice(i, 1);
            res.send(200);
            console.log('session with token : ' + logoutToken + ' was terminated');
            break;
        }
        if (i === tokenArray.length - 1) {
            res.send(401);
            console.log('there is no such token');
        }
    } 
});

//---------------------------------------
//LOGIN & REGISTER NEW USER SERVER PART END



//------------------------------
// SCHEDULE SERVER PART BEGINNING

//get respond sends list of all tasks from mongo_db to a client
app.get('/rest/todo/:month/:day/:year', function(req, res, next) {
    for (var i = 0; i < tokenArray.length; i++) {
        //check if token for the session exists:
        if(tokenArray[i] === req.headers['x-auth']) {
            var month = parseInt(req.params.month);
            var day = parseInt(req.params.day);
            var year = parseInt(req.params.year);

            //checks if format of request is correct;
            if (isNaN(month) || isNaN(day) || isNaN(year)) {
                console.error("not a number, please put correct date");
                res.send(404, {'message': errorMessage.wrongDateFormat});
            };
            //check if dates interval is correct;
            if ((month < 1) || (month > 12) || (day < 1) || (day > 31) || (year > 9999) || (year < 1)) {
                console.error("date does not exist, please put correct date");
                res.send(404, {'message': errorMessage.wrongDateRange});
            };
            //respond: list of tasks for a day;        
            newSchedTask.find({'month': month, 'day': day, 'year': year}).sort('username').sort('start').exec(function(err, response) {
                //if error
                if (err) {
                    console.error(err);
                }
                if (response.length > 0) {
                    res.send(response);
                    console.log(response);
                } else {
                    //response if task for a day does not exist yet;
                    res.send({'message': errorMessage.emptyTask});
                    console.log(errorMessage.emptyTask);
                }
            });
        }
    }
});
//get respond all records (we do not use the option)
app.get('/rest/todo', function(req, res, next) {
    newSchedTask.find().sort('username').exec(function(err, tasks) {
        if (err) { console.error(err); }
        console.log(tasks);
        res.send(tasks);
    });
});
//adding a new task
app.post('/rest/todo', function(req, res, next) {
    var newTask = req.body;    
    newSchedTask.find(function(err, tasks) {
        if (err) { console.error(err); }
        //newTaskUser to save to db mops_db:
        var newUserTask = new newSchedTask({
            "username": newTask.username,
            "day": newTask.day,
            "month": newTask.month,
            "year": newTask.year,
            "task": newTask.task,
            "start": newTask.start,
            "finish": newTask.finish
        });
        //save data to db
        newUserTask.save(function(err, newUserTask) {
            if (err) { console.error(err); }
            console.log(newUserTask);
            res.send(newUserTask);
        });
    });
});
//editing existing task
//':id' is equivalent of ':_id'
app.put('/rest/todo/:id', function(req, res, next) {
    var updateTask = req.body;
    console.log(updateTask);
     var newUserTaskUpdate = {
        "username": updateTask.username,
        "task": updateTask.task,
        "start": updateTask.start,
        "finish": updateTask.finish
    };
    var updateId = req.params.id;
    console.log(updateId);
    newSchedTask.update({"_id": updateId}, {"$set": newUserTaskUpdate}, function(err, updateTask) {
        if (err) { 
            console.error(err);
            res.status(err);
        } else {
            res.send(newUserTaskUpdate);
            console.log(updateTask);
        }
    });
}); 
//delete an item from array
app.delete('/rest/todo/:id', function(req, res, next) {
    var deleteTaskId = req.params.id;
    //poll all data to find the 'id'
    newSchedTask.find(function(err, tasks) {
        if (err) { console.error(err); }
        newSchedTask.remove({'_id': deleteTaskId}, function(err, deleteTask) {
            if (err) { console.error(err); }
            console.log("Task with ID = " + deleteTaskId + " is deleted: " + deleteTask);
            res.send({"_id" : deleteTaskId});
        });
    });
});


//SCHEDULE PART SERVER END
//--------------------------------------------------

//if not found
app.use(function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
//if server error
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'), function() {
    console.log("express is running on URL http://localhost:" + app.get('port') + "/");
});