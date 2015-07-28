'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//model with tasks
var newSchedTask = require('./server/components/newUserTask');
//response for all errors including empty tasks, wrong dates, wrong formats
var errorMessage = require('./server/components/errorMessages');

app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

//get respond sends list of all tasks from mongo_db to a client
app.get('/rest/todo/:month/:day/:year', function(req, res, next) {
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