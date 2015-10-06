'use strict';

angular.module('schedulerApp')
    .controller('scheduleController', ['scheduleService', '$http', '$rootScope', '$scope', '$window', '$modal', function(scheduleService, $http, $rootScope, $scope, $window, $modal) {
        var self = this;
        //used for add a task function;
        var enteredMonth;
        var enteredDay;
        var enteredYear;

        //DATEPICKER
        $scope.open = function() {
            $scope.status = true;
        };
        //Start time by default in time picker
        var taskStartTime = new Date();
        taskStartTime.setHours(taskStartTime.getHours() + 1);
        taskStartTime.setMinutes(0);
        $scope.newTaskStart = taskStartTime;
        //Finish time by default in time picker
        var taskFinishTime = new Date();
        taskFinishTime.setHours(taskFinishTime.getHours() + 2);
        taskFinishTime.setMinutes(0);
        $scope.newTaskFinish = taskFinishTime;

        $scope.clear = function() {
            $scope.date = null;
        };

        //COLLAPSE DETAILS
        $scope.isCollapsed = false;

        //WS + MODAL MESSAGE BLOCK

        self.wsMessageArray = scheduleService.wsMessage();
        $rootScope.$on('rootScope:broadcast', function(event, data) {
            if (data.username) {
                $scope.items = [(data.username + ' asks : ' + data.taskDescription)];
                var modalInstance = $modal.open({
                    templateUrl: 'modalContent.html',
                    controller: 'modalInstanceCtrl',
                    resolve: {
                        items: function () {
                            return $scope.items;
                        }
                    }
                });
                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                });
            }
        });

        //TIMEPICKER
        var newTaskStartTime = taskStartTime;
        var newTaskFinishTime = taskFinishTime;

        $scope.changeStart = function () {
            newTaskStartTime = $scope.newTaskStart;            
            if (newTaskStartTime > newTaskFinishTime) {
                $scope.timepickerMessage = '"Start" should be earlier then "Finish"';
            } else {
                $scope.timepickerMessage = '';
            }
        };
        $scope.changeFinish = function () {
            newTaskFinishTime = $scope.newTaskFinish;            
            if (newTaskFinishTime < newTaskStartTime) {
                $scope.timepickerMessage = '"Finish" should be later then "Start"';
            } else {
                $scope.timepickerMessage = '';
            }
        };

        //not save option to use $rootScope to pass token (need to find better way)
        var token = $rootScope.token;
        //function to read 'list' array of tasks from file in data folder
        var taskListArrayRead = function(month, day, year) {
            scheduleService.readList(month, day, year, token).then(function(response) {
                // Array of tasks to show in UI;
                var startTime, startHours, startMinutes, 
                    finishTime, finishHours, finishMinutes;

                var receivedData = response.data;
                if (receivedData.length !== 0) {
                    for (var i = 0; i < receivedData.length; i++) {
                        startTime = new Date(receivedData[i].start);
                        startHours = startTime.getHours();
                        startMinutes = startTime.getMinutes();
                        receivedData[i].start = startHours + ':' + startMinutes;
                        receivedData[i].status = false;
                        receivedData[i].taskDescription = 'task description';

                        finishTime = new Date(receivedData[i].finish);
                        finishHours = finishTime.getHours();
                        finishMinutes = finishTime.getMinutes();
                        receivedData[i].finish = finishHours + ':' + finishMinutes;                        
                    }
                }
                self.taskListArray = receivedData;
            //<---LOOP TO SHOW USERNAME ONLY ONCE--->
                //create Array which will contain only unique names
                var existNameArray = [];
                //add first element from server data to empty array
                existNameArray[0] = self.taskListArray[0];
                for (var ii = 0; ii < self.taskListArray.length; ii++) {
                    //need to make separate function for the second loop
                    var n = existNameArray.length;
                    for (var j = 0; j < n; j++) {
                        if (ii === 0) {
                            self.taskListArray[ii].existName = false;
                            break;
                        }
                        if ((existNameArray[j].username === self.taskListArray[ii].username) && (ii !== 0)) {
                            self.taskListArray[ii].existName = true;
                            break;
                        }
                        if ((existNameArray[j].username !== self.taskListArray[ii].username) && (j === n - 1)) {
                            self.taskListArray[ii].existName = false;
                            existNameArray.push(self.taskListArray[ii]);
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
            //start should be earlier then finish
            if (newTaskStartTime < newTaskFinishTime) {
                scheduleService.addNewTask({
                    'username' : $scope.newTask.username, 'start' : newTaskStartTime,
                    'finish' : newTaskFinishTime, 'task' : $scope.newTask.task,
                    'day': enteredDay, 'month': enteredMonth, 'year': enteredYear, 'existName': existName
                }).then(function(response, err) {
                    taskListArrayRead(enteredMonth, enteredDay, enteredYear);
                    if (err) {
                        console.error(err); 
                    }
                });
            }
            init();
        };
        //function to delete a task
        this.delete = function(_id) {
            var deleteTaskID = {'deleteID': _id};
            scheduleService.deleteTask(deleteTaskID).then(function(response, err) {
                taskListArrayRead(enteredMonth, enteredDay, enteredYear);
                if (err) {
                    console.log(err);
                }
            });
        };
        //change status
        this.statusChange = function(id, username, flag, taskDescription) {
            
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i]._id === id) {
                    this.taskListArray[i].status = flag;
                    if (flag === 'question') {
                        $window.alert('Send message to your team?');
                        $http.get('message/' + username + '/' + taskDescription);
                    }
                }
            }
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
            scheduleService.saveTask(this.taskListArray[toSaveElementNumber]).then(
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
            scheduleService.logout(token).then(
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
    }]);
