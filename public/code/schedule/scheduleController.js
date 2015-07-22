angular.module('scheduleOfTeam')
    .controller("scheduleController", function(jsonService, $http) {
       // var idGenerator = 0; is not used
        var self = this;
        var message = [];
        //used for add a task function;
        var enteredMonth;
        var enteredDay;
        var enteredYear;
        
        //function to read 'list' array of tasks from file in data folder           
        var taskListArrayRead = function(month, day,  year) {
            jsonService.readList(month, day, year).then(function(response) {
                self.taskListArray = response.data;
                //need to add  function to find bigest 'task_id' number from array to replace idGenerator=1 number            
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
            $http.get('rest/initList.json').then(function(response) {
                self.newTask.username = response.data.username;
                self.newTask.priority = response.data.priority;
                self.newTask.type = response.data.type;
                self.booleanProgress = response.data.booleanProgress;
                self.newTask.percentageMessage = response.data.percentageMessage;
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
                self.taskListArray.push(response.data);
            });
            init();
        };
        //function to delete a task
        this.delete = function(task_id, enteredMonth, enteredDay, enteredYear) {
            var deleteTaskID = {'deleteID': task_id};
            var scheduleOfTeamArray = self.taskListArray;
            //variable 'deleteId'to delete a task from controller
            var deleteId;
            //cycle to find requested task in 'scheduleOfTeamArray'
            for (var i = 0; i < scheduleOfTeamArray.length; i++) {
                if (scheduleOfTeamArray[i].task_id === task_id)
                    deleteId = i;
            }
            //delete a requested task from 'scheduleOfTeamArray' array in controller
            self.taskListArray.splice(deleteId, 1);
            jsonService.deleteTask(deleteTaskID).then(function(response, err) {
                if (err)
                    alert(err);
            });
        };
        //this function is to edit a Task
        this.edit = function(task_id) {
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i].task_id == task_id)
                    this.taskListArray[i].isEditing = true;
            }
        };
        //this function is to Save edited Task
        this.save = function(task_id) {
            var scheduleOfTeamArray = this.taskListArray;
            var toSaveElementNumber;
            for (var i = 0; i < scheduleOfTeamArray.length; i++) {
                if (scheduleOfTeamArray[i].task_id === task_id) {
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
    })
    .factory("jsonService", ['$http', '$q', function($http, $q) {
        return {readList: function(month, day, year) {
            var res = {
                    method: 'GET',                    
                    url: 'http://localhost:3000/rest/todo/' + month + '/' + day + '/' + year
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
                    url: '/rest/todo/' + saveTask.task_id,
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
            }
        };         
    }]);
