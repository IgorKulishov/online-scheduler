angular.module('scheduleOfTeam')
    .controller("scheduleController", function(jsonService, $http, $rootScope) {
        var self = this;
        //used for add a task function;
        var enteredMonth;
        var enteredDay;
        var enteredYear;
        //not save option to use $rootScope to pass token (need to find better way)
        var token = $rootScope.token;
        //function to read 'list' array of tasks from file in data folder
        var taskListArrayRead = function(month, day,  year) {
            jsonService.readList(month, day, year, token).then(function(response) {
                // Array of tasks to show in UI;
                self.taskListArray = response.data;
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
                        if ((existNameArray[j].username === self.taskListArray[i].username) && (i != 0)) {
                            self.taskListArray[i].existName = true;
                            break;
                        }
                        if ((existNameArray[j].username != self.taskListArray[i].username) && (j === n - 1)) {
                            self.taskListArray[i].existName = false;
                            existNameArray.push(self.taskListArray[i]);
                            break;
                        }
                    }
                }
                if (!self.taskListArray._id) 
                    self.message = response.data.message;
            }, function(errResponse) {
                    for (var key in errResponse)
                        alert(' Error while fetching notes ' + errResponse[key]);
                }
            );
        };
        
        this.chooseDate = function(date) {
            taskListArrayRead(date.month, date.day, date.year);
            enteredMonth = date.month;
            enteredDay = date.day;
            enteredYear = date.year;
        };
        // function to fill in initial information into the "add new task" form from 'txt' file
        var init = function() {
            self.newTask = {};
            self.newTask.isEditing = false;
            
            //presentation object is in data/TaskList.txt file
            $http.get('code/schedule/rest/initList.json').then(function(response) {
                self.newTask.username = response.data.username;
                self.newTask.priority = response.data.priority;
                self.newTask.type = response.data.type;
            }, function(errResponse) {
                alert('Error while fetching notes');
            });
        };   
        init();
        //function to add new Task 
        this.addTask = function(taskToAdd) {
            //here can be implemented 'bcrypt'-tion to sign packages with x-auth
            var existName = false;
            for (var i = 0; i < self.taskListArray.length; i++) {
                if (self.taskListArray[i].username === taskToAdd.username) {
                    existName = true;
                    break;
                }
            }
            jsonService.addNewTask({
                "username" : taskToAdd.username, "start" : taskToAdd.start, 
                "finish" : taskToAdd.finish, "task" : taskToAdd.task,
                "day": enteredDay, "month": enteredMonth, "year": enteredYear, "existName": existName
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
                if (err)
                    alert(err);
            });
        };
        //this function is to edit a Task
        this.edit = function(_id) {
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i]._id == _id)
                    this.taskListArray[i].isEditing = true;
            }
        };
        //this function is to Save edited Task
        this.save = function(_id) {
            var scheduleOfTeamArray = this.taskListArray;
            var toSaveElementNumber;
            for (var i = 0; i < scheduleOfTeamArray.length; i++) {
                if (scheduleOfTeamArray[i]._id == _id) {
                    toSaveElementNumber = i;                    
                }
            }
            this.taskListArray[toSaveElementNumber].isEditing = false;
            jsonService.saveTask(scheduleOfTeamArray[toSaveElementNumber]).then(
                function(response) {
                    
                },
                function(err) {
                    alert(err);
                }
            );
        };
        this.logout = function() {
            jsonService.logout(token).then(
                function(response) {
                    $rootScope.token = 0;
                    init();
                },
                function(err) {
                    alert(err);
                }
            );
        };
    })
    .factory("jsonService", ['$http', '$q', function($http, $q) {
        return {readList: function(month, day, year, token) {
            var res = {
                    method: 'GET',                    
                    url: ('/rest/todo/' + month + '/' + day + '/' + year),
                    headers: {
                        'x-auth' : token
                    }
                };                           
            return $http(res);              
            }, addNewTask: function(newTask) {
                var req = {
                    method: 'POST',
                    url: '/rest/todo',
                    data: newTask,
                    headers: {'Content-Type': 'application/json'}
                };
                return $http(req);                                                                                                          
            }, deleteTask: function(deleteTaskNumber) {
                var req = {
                    method: 'DELETE',
                    url: '/rest/todo/' + deleteTaskNumber.deleteID,
                    headers: {'Content-Type': 'application/json'}
                };
                return $http(req);
            }, saveTask: function(saveTask) {
                var req = {
                    method: 'PUT',
                    url: '/rest/todo/' + saveTask._id,
                    data: saveTask,
                    headers: {'Content-Type': 'application/json'}
                };
                return $q(function(resolve, reject) {
                    if ($http(req)) {
                        resolve($http(req));
                    } else {
                        reject($http(req))
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
