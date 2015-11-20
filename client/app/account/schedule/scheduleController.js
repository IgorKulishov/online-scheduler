'use strict';

angular.module('schedulerApp')
    .controller('scheduleController', ['scheduleService', '$http', '$rootScope', '$scope', '$window', 
        '$modal', 'Auth', 'User', '$location', '$cookieStore', 'scheduleVoiceService', '$interval', function(scheduleService, $http, $rootScope, $scope, $window, $modal, Auth, User, $location, $cookieStore, scheduleVoiceService, $interval) {

        var confirmStatus = 0;
        var self = this;
        //used for add a task function;
        var enteredMonth;
        var enteredDay;
        var enteredYear;
        var intervalPromise;
        //checking if token exists (this function is optional and dublicate main functionality on serer side)
        if (!$cookieStore.get('token')) {
            $location.path('/login');
        }

        //function to open date for voice recognition function askDate();
        function sendMessageToDom(date) {
            $scope.chooseDate(date);
        }
        //function uses voice recognition (asks date)
        function askDate() {
            scheduleVoiceService.ask('Please tell me date in the format of: Month.. Day.. and Year', function (err, result) {
                var saidText = result.transcript;
                scheduleVoiceService.ask('If you said' + saidText + 'please say "YES"', function(err, res) {
                    if (res.transcript === 'yes') {
                        var saidDate = saidText.replace(/th/, '')
                        var date = new Date(saidDate);
                        sendMessageToDom(date);
                        scheduleVoiceService.speak("Thank you!");
                    } else {
                        askDate();
                    }
                });
            });
        }
        //check if Browser is Chrome
        if(navigator.userAgent.indexOf("Chrome") != -1 ) {
        //Auth.getCurrentUser.name
            scheduleVoiceService.speak('Hi! This is voice recognition system')
            scheduleVoiceService.ask('If you want to use voice please say "YES!"', function (err, result) {
                if (result.transcript === 'yes') {
                    scheduleVoiceService.speak('Thank you!');
                    askDate();
                } else {
                    scheduleVoiceService.speak("Please choose date manually");
                    //scheduleVoiceService.speak(result.transcript);
                }
            });
        }

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



        //--- List of registered Users to show in dropdown menu at 'Add new Task' menu---//        
        self.registeredUsers = User.query();
        //self.usernameTest = usernameTest;
            $scope.newTask = {};
        self.subMenuClickTest = function(username) {
            $scope.newTask.username = username;
        };

        //---END OF TEST AREA---//



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
        function taskListArrayRead(month, day, year) {
            scheduleService.readList(month, day, year, token).then(function(response) {
                // Loop to tranfer time from string to time format and to assign default status and taskDescription
                var nowTime = new Date();
                var receivedData = response.data;
                if (receivedData.length !== 0) {
                    for (var i = 0; i < receivedData.length; i++) {
                        receivedData[i].start = new Date(receivedData[i].start);
                        receivedData[i].status = false;
                        //receivedData[i].taskDescription = 'task description';
                        receivedData[i].finish = new Date(receivedData[i].finish);
                    }
                }
                self.taskListArray = receivedData;
            //<---LOOP TO SHOW USERNAME ONLY ONCE--->
                //create Array which will contain only unique names
                var existNameArray = [];
                //add first element from server data to empty array
                existNameArray[0] = self.taskListArray[0];
                for (var ii = 0; ii < self.taskListArray.length; ii++) {
                    //asign style for usernames
                    if ( self.taskListArray[ii].start > nowTime && self.taskListArray[ii].finish > nowTime) {
                        self.taskListArray[ii].style = {'color':'blue'};
                    } if ( self.taskListArray[ii].start < nowTime && self.taskListArray[ii].finish < nowTime) {
                        self.taskListArray[ii].style = {'color':'red'};
                    } if ( self.taskListArray[ii].start < nowTime && self.taskListArray[ii].finish > nowTime) {
                        self.taskListArray[ii].style = {'color':'green'};
                        self.taskListArray[ii].taskRemain = (self.taskListArray[ii].finish.getHours() - nowTime.getHours()) * 60 + self.taskListArray[ii].finish.getMinutes() - nowTime.getMinutes() + ' m';
                    }
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

        $scope.chooseDate = function chooseDate(date) {

            var choosenDay = new Date(date);
            var day = choosenDay.getDate();
            var month = choosenDay.getMonth() + 1;
            var year = choosenDay.getFullYear();
            
            $interval.cancel(intervalPromise);

            taskListArrayRead(month, day, year);
            intervalPromise = $interval(function() {
                var index = 0;
                for (var i = 0; i < self.taskListArray.length; i++) {
                    if ((self.taskListArray[i].isEditing === true) || (self.taskListArray[i].isOpenned === true)) {
                        index = 1;
                    } else {
                        //there is no condition;
                    }
                }
                if (index === 0) {
                    taskListArrayRead(month, day, year);
                } else {

                }
            }, 10000);

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
        this.addTask = function addTask() {
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
        //change status in task description
        this.statusChange = function(id, username, flag, taskDescription) {
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i]._id === id) {
                    this.taskListArray[i].status = flag;
                    if (flag === 'question') {
                        $window.alert('Send message to your team? ');
                        $http.get('message/' + username + '/' + taskDescription);
                    }
                }
            }
        };

        this.saveTaskDescription = function(id) {
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i]._id === id) {
                    scheduleService.saveTask(this.taskListArray[i]).then(
                            function(response) {
                                console.log(response);
                                
                            },
                            function(err) {
                                console.log(err);
                            }
                        );
                }
            }
        };

        var taskListArrayStartTime = [];
        var taskListArrayFinishTime = [];
        //this function is to edit a Task
        this.edit = function(_id) {
            var arrayId;
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (self.taskListArray[i]._id === _id) {
                    self.taskListArray[i].isEditing = true;
                    arrayId = i;
                }
            }
            //to adjust finish time using 'timepicker' in edit mode
            $scope.editStart = function () {

            };
            //to adjust finish time using 'timepicker' in edit mode
            $scope.editFinish = function () {

            };
        };
        // Open/Close task details
        this.collapse = function(id) {
            
            for (var i = 0; i < this.taskListArray.length; i++) {
                if ((self.taskListArray[i]._id === id) && (!self.taskListArray[i].isOpenned)) {
                    self.taskListArray[i].isOpenned = true;
                    break;
                } if ((self.taskListArray[i]._id === id) && (self.taskListArray[i].isOpenned)) {
                    self.taskListArray[i].isOpenned = false;
                }
            }
            //to adjust finish time using 'timepicker' in edit mode
            $scope.editStart = function () {

            };
            //to adjust finish time using 'timepicker' in edit mode
            $scope.editFinish = function () {

            };
        };

        //this function is to Save edited Task
        this.save = function(_id) {
            var scheduleOfTeamArray = this.taskListArray;
            var toSaveElementNumber;
            for (var i = 0; i < scheduleOfTeamArray.length; i++) {
                if (scheduleOfTeamArray[i]._id === _id) {
                    toSaveElementNumber = i;                
                }
            }
            this.taskListArray[toSaveElementNumber].isEditing = false;
            if (this.taskListArray[toSaveElementNumber].start < this.taskListArray[toSaveElementNumber].finish) {
                $scope.editMessage = '';
                scheduleService.saveTask(this.taskListArray[toSaveElementNumber]).then(
                    function(response) {
                        console.log(response);
                        taskListArrayRead(enteredMonth, enteredDay, enteredYear);
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            } else {
                $scope.editMessage = 'start should be less then finish';
            }
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
