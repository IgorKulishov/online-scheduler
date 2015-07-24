'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var newSchedTask = require('./server/components/newUserTask');
var defaultTask = require('./server/components/defaultTask');

app.use(bodyParser.json());
//path to html and assigning
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

//get respond sends list of all tasks from mongo_db to a client
app.get('/rest/todo/:month/:day/:year', function(req, res, next) {
    var month = parseInt(req.params.month);
    var day = parseInt(req.params.day);
    var year = parseInt(req.params.year);
    var response = [];
    var defaultTaskErrorMessage = new defaultTask({
        "username": 'There_is_no_task',
        "day": 0,
        "month": 0,
        "year": 0,
        "task": 'please_create_a_task',
        "start": 1,
        "finish": 2,
        "existName": false        
    });

    newSchedTask.find(function(err, tasks) {
        //if error
        if (err) {
            console.error(err);
        }
        //if no tasks
        if (!tasks) {
            console.error("Data base is empty. There is no tasks for the moment");
            res.send('no records');
        }
        //respond if there are tasks 
        if (tasks) {
            for (var i = 0; i < tasks.length; i++) {
                if ((tasks[i].month === month) && (tasks[i].day === day) && (tasks[i].year)) {
                    response.push(tasks[i]);
                }
            }
            if (response.length === 0) {
                console.log('there is no record for the day');
                res.send(defaultTaskErrorMessage);
            }

            console.log(response);
            res.send(response);
        }
    });
});
//get respond all records
app.get('/rest/todo', function(req, res, next) {
    newSchedTask.find(function(err, tasks) {
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
            "finish": newTask.finish,
            "existName": newTask.existName
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
        "finish": updateTask.finish,
        "existName": updateTask.existName
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
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i]._id == deleteTaskId) {
                newSchedTask.remove({"_id": deleteTaskId}, function(err, taskToDelete) {
                    if (err) { console.error(err); }
                    console.log("Task with ID = " + deleteTaskId + " is deleted");
                    res.send({"_id" : deleteTaskId});
                }, 1);                
                break;
            }
        }
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