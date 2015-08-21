/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /tasks              ->  index
 * POST    /tasks              ->  create
 * GET     /tasks/:id          ->  show
 * PUT     /tasks/:id          ->  update
 * DELETE  /tasks/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Task = require('./schedule.model');
var errorMessage = require('../../../server/components/errorMessages');

// Get list of tasks
exports.index = function(req, res) {
    var month = parseInt(req.params.month);
    var day = parseInt(req.params.day);
    var year = parseInt(req.params.year);
    //checks if format of request is correct;
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        console.error("not a number, please put correct date");
        res.send(404, 'message: no params, please choose a date');
    }
    //check if dates interval is correct;
    if ((month < 1) || (month > 12) || (day < 1) || (day > 31) || (year > 9999) || (year < 1)) {
        console.error("date does not exist, please put correct date");
        res.send(404, 'message: wrong date, please choose a date');
    }
    //respond: list of tasks for a day;        
    Task.find({'month': month, 'day': day, 'year': year}).sort('username').sort('start').exec(function(err, response) {
        //if error
        if (err) {
            console.error(err);
        }
        if (response.length > 0) {
            console.log(response);
            return res.send(response);
        } else {
            //response if task for a day does not exist yet;
            //res.send({message: errorMessage.emptyTask});
            console.log('the task does not exist');
            return res.json(200, response);
        }
    });
};

// Get a single task
exports.show = function(req, res) {
  Task.findById(req.params.id, function (err, task) {
    if (err) { return handleError(res, err); }
    if (!task) { return res.send(404); }
    return res.json(task);
  });
};

// Creates a new task in the DB.
exports.create = function(req, res) {
  Task.create(req.body, function(err, task) {
    if (err) { return handleError(res, err); }
    return res.json(201, task);
  });
};

// Updates an existing task in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  Task.findById(req.params.id, function (err, task) {
    if (err) { return handleError(res, err); }
    if (!task) { return res.send(404); }
    var updated = _.merge(task, req.body);
    updated.save(function (err, update_res) {
      if (err) { return handleError(res, err); }
      console.log(update_res);
      return res.json(200, task);
    });
  });
};

// Deletes a task from the DB.
exports.destroy = function(req, res) {
  Task.findById(req.params.id, function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task) { return res.send(404); }
    task.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}