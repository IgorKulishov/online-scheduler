'use strict';

angular.module('schedulerApp')
    .controller('scheduleController', function(jsonService, $http, $rootScope, $scope) {
        var self = this;
        //used for add a task function;
        var enteredMonth;
        var enteredDay;
        var enteredYear;

        //DATEPICKER
        $scope.open = function() {
            $scope.status = true;
        };

        var today = new Date();

        $scope.clear = function () {
            $scope.date = null;
        };

        //TIMEPICKER
        var newTaskStartTime = today.getHours()*60;
        var newTaskFinishTime = today.getHours()*60;

        $scope.changedStart = function () {
            newTaskStartTime = $scope.newTask.start.getHours()*60 + $scope.newTask.start.getMinutes();
        };
        $scope.changedFinish = function () {
            newTaskFinishTime = $scope.newTask.finish.getHours()*60 + $scope.newTask.finish.getMinutes();
        };

        //not save option to use $rootScope to pass token (need to find better way)
        var token = $rootScope.token;
        //function to read 'list' array of tasks from file in data folder
        var taskListArrayRead = function(month, day, year) {
            jsonService.readList(month, day, year, token).then(function(response) {
                // Array of tasks to show in UI;
                var startTime, startHours, startMinutes, 
                    finishTime, finishHours, finishMinutes;

                var receivedData = response.data;
                if (receivedData.length !== 0) {
                    for (var i = 0; i < receivedData.length; i++) {
                        startTime = receivedData[i].start;
                        startHours = Math.floor(startTime/60);
                        startMinutes = startTime - startHours*60;
                        receivedData[i].start = startHours + ':' + startMinutes;

                        finishTime = receivedData[i].finish;
                        finishHours = Math.floor(finishTime/60);
                        finishMinutes = finishTime - finishHours*60;
                        receivedData[i].finish = finishHours + ':' + finishMinutes;                        
                    }
                }
               self.taskListArray = receivedData;
            //<---LOOP TO SHOW USERNAME ONLY ONCE--->
                //create Array which will contain only unique names
                var existNameArray = [];
                //add first element from server data to empty array
                existNameArray[0] = self.taskListArray[0];
                for (var i = 0; i < self.taskListArray.length; i++) {
                    //need to make separate function for the second loop
                    var n = existNameArray.length;
                    for (var j = 0; j < n; j++) {
                        if (i === 0) {
                            self.taskListArray[i].existName = false;
                            break;
                        }
                        if ((existNameArray[j].username === self.taskListArray[i].username) && (i !== 0)) {
                            self.taskListArray[i].existName = true;
                            break;
                        }
                        if ((existNameArray[j].username !== self.taskListArray[i].username) && (j === n - 1)) {
                            self.taskListArray[i].existName = false;
                            existNameArray.push(self.taskListArray[i]);
                            break;
                        }
                    }
                }
                if (!self.taskListArray._id) {
                    self.message = response.data.message;
                }
            }, function(errResponse) {
                    for (var key in errResponse) {
                        console.log(' Error while fetching notes ' + errResponse[key]);
                    }
                }
            );
        };
        
        $scope.chooseDate = function(date) {

            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();

            taskListArrayRead(month, day, year);
            enteredMonth = month;
            enteredDay = day;
            enteredYear = year;
        };
        // function to fill in initial information into the 'add new task' form from 'txt' file
        var init = function() {
            self.newTask = {};
            self.newTask.isEditing = false;
            
            //presentation object is in data/TaskList.txt file
            $http.get('code/schedule/rest/initList.json').then(function(response) {
                self.newTask.username = response.data.username;
                self.newTask.priority = response.data.priority;
                self.newTask.type = response.data.type;
            }, function(errResponse) {
                console.log('Error while fetching notes' + errResponse);
            });
        };   
        init();
        //function to add new Task
        this.addTask = function() {
            //here can be implemented 'bcrypt'-tion to sign packages with x-auth
            var existName = false;
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i].username === $scope.newTask.username) {
                    existName = true;
                    break;
                }
            }

            jsonService.addNewTask({
                'username' : $scope.newTask.username, 'start' : newTaskStartTime,
                'finish' : newTaskFinishTime, 'task' : $scope.newTask.task,
                'day': enteredDay, 'month': enteredMonth, 'year': enteredYear, 'existName': existName
            }).then(function(response, err) {
                taskListArrayRead(enteredMonth, enteredDay, enteredYear);
                if (err) {
                    console.error(err); 
                }
            });
            init();
        };
        //function to delete a task
        this.delete = function(_id) {
            var deleteTaskID = {'deleteID': _id};
            jsonService.deleteTask(deleteTaskID).then(function(response, err) {
                taskListArrayRead(enteredMonth, enteredDay, enteredYear);
                if (err) {
                    console.log(err);
                }
            });
        };

        //this function is to edit a Task
        this.edit = function(_id) {
            var arrayId;
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i]._id === _id) {
                    this.taskListArray[i].isEditing = true;
                    arrayId = i;
                }
            }
            //to adjust start time using 'timepicker' in edit mode
            $scope.editStart = function () {
               self.taskListArray[arrayId].start.time = self.taskListArray[arrayId].start.getHours()*60 + self.taskListArray[arrayId].start.getMinutes();
            };
            //to adjust finish time using 'timepicker' in edit mode
            $scope.editFinish = function () {
               self.taskListArray[arrayId].finish.time = self.taskListArray[arrayId].finish.getHours()*60 + self.taskListArray[arrayId].finish.getMinutes();
            };

        };
        //this function is to Save edited Task
        this.save = function(_id) {
            var scheduleOfTeamArray = this.taskListArray;
            var toSaveElementNumber;
            for (var i = 0; i < scheduleOfTeamArray.length; i++) {
                if (scheduleOfTeamArray[i]._id === _id) {
                    toSaveElementNumber = i;
                    this.taskListArray[toSaveElementNumber].start = this.taskListArray[toSaveElementNumber].start.time;
                    this.taskListArray[toSaveElementNumber].finish = this.taskListArray[toSaveElementNumber].finish.time;
                }
            }
            this.taskListArray[toSaveElementNumber].isEditing = false;
            jsonService.saveTask(this.taskListArray[toSaveElementNumber]).then(
                function(response) {
                    console.log(response);
                    taskListArrayRead(enteredMonth, enteredDay, enteredYear);
                },
                function(err) {
                    console.log(err);
                }
            );
        };
        this.logout = function() {
            jsonService.logout(token).then(
                function(response) {
                    $rootScope.token = 0;
                    init();
                    console.log(response);
                },
                function(err) {
                    console.log(err);
                }
            );
        };
    })
    .factory('jsonService', ['$http', '$q', function($http, $q) {
        return {readList: function(month, day, year, token) {
            var res = {
                    method: 'GET',
                    url: ('/api/schedule/' + month + '/' + day + '/' + year),
                    headers: {
                        'x-auth' : token
                    }
                };
            return $http(res);
            }, addNewTask: function(newTask) {
                var req = {
                    method: 'POST',
                    url: '/api/schedule',
                    data: newTask,
                    headers: {'Content-Type': 'application/json'}
                };
                return $http(req);
            }, deleteTask: function(deleteTaskNumber) {
                var req = {
                    method: 'DELETE',
                    url: '/api/schedule/' + deleteTaskNumber.deleteID,
                    headers: {'Content-Type': 'application/json'}
                };
                return $http(req);
            }, saveTask: function(saveTask) {
                console.log(saveTask.start);
                var req = {
                    method: 'PUT',
                    url: '/api/schedule/' + saveTask._id,
                    data: saveTask,
                    headers: {'Content-Type': 'application/json'}
                };
                return $q(function(resolve, reject) {
                    if ($http(req)) {
                        resolve($http(req));
                    } else {
                        reject($http(req));
                    }
                });
            }, logout: function(token) {
                var req = {
                    method: 'PUT',
                    url: '/rest/logout',                    
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth' : token
                    }
                };
                return $http(req);
            }
        };         
    }]);
