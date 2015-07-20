var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var NewUserTask = require('./server/components/newUserTask');
var taskIdGenerator = 0;
var subTaskIdGenerator = 0;

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
    NewUserTask.find(function(err, tasks) {
        //if error
        if (err) { 
            throw console.log(err)
        }
        //if no tasks
        if (!tasks) {
            res.send(defaultTaskErrorMessage);    
        }
        //respond if there are tasks 
        if (tasks) {
            for (var i = 0; i < tasks.length; i++) {
                if ((tasks[i].month === month) && (tasks[i].day === day) && (tasks[i].year)) {
                    response.push(tasks[i]);
                }
            }
            console.log(response);
            res.send(response);
        }
    });
});
//get respond all records
app.get('/rest/todo', function(req, res, next) {
    NewUserTask.find(function(err, tasks) {
        if (err) { throw console.log(err)}
        console.log(tasks);
        res.send(tasks);    
    });
});
//adding a new task
app.post('/rest/todo', function(req, res, next) {
    var newTask = req.body;
    //var taskArray = [];
    NewUserTask.find(function(err, tasks) {
        if (err) { throw console.log(err) }
        taskArray = tasks;
        if ((tasks.length) === 0)
            taskIdGenerator = 0;
        if ((tasks.length) > 0)
            taskIdGenerator = tasks[(tasks.length - 1)].task_id + 1;
        //newTaskUser to save to db mops_db:
        var newUserTask = new NewUserTask({
            "task_id": taskIdGenerator,
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
            if (err) { throw console.log(err)}
            console.log(newUserTask);
            res.send(newUserTask);
        });
    });
});
//editing existing task
//':id' is equivalent of ':task_id'
app.put('/rest/todo/:id', function(req, res, next) {
    var updateTask = req.body;
    console.log(updateTask);
     var newUserTaskUpdate = {
        "username": updateTask.username,
        "task": updateTask.task,
        "start": updateTask.start,
        "finish": updateTask.finish,
        "task_id": updateTask.task_id,
        "existName": updateTask.existName
    };
    var updateId = parseInt(req.params.id);
    console.log(updateId);
    NewUserTask.update({"id": updateId}, {"$set": newUserTaskUpdate}, function(err, updateTask) {
        if (err) { 
            throw console.log(err);
            res.status(err);
        } else {
            res.send(newUserTaskUpdate);
            console.log(updateTask);
        }
    });
}); 
//delete an item from array
app.delete('/rest/todo/:id', function(req, res, next) {
    var deleteTaskId = parseInt(req.params.id);
    //poll all data to find the 'id'
    NewUserTask.find(function(err, tasks) {
        if (err) { throw console.log(err) }
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].task_id === deleteTaskId) {
                NewUserTask.remove({"task_id": deleteTaskId}, function(err, taskToDelete) {
                    if (err) { throw console.log(err) }
                    console.log("Task with ID = " + deleteTaskId + " is deleted");
                    res.send({"id" : deleteTaskId});
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