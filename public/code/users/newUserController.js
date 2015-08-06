angular.module('scheduleOfTeam')
    .controller("newUserController", function(newUserService, $http) {
        var self = this;
        //used for add a task function;
        var enteredMonth;
        var enteredDay;
        var enteredYear;
        
        //function to read 'list' array of tasks from file in data folder
        var listOfUsers = function() {
            newUserService.readListOfUsers().then(function(response) {
                // Array of users to show in UI;
                self.usersListArray = response.data;
                }, function(errResponse) {
                    for (var key in errResponse)
                        alert(' Error while fetching notes ' + errResponse[key]);
                }
            );
        };
        listOfUsers();
        // function to fill in initial information into the "add new task" form from 'txt' file
        var init = function() {
            self.newUser = {};
            self.newUser.isEditing = false;
            
            //presentation object is in data/TaskList.txt file
            $http.get('code/schedule/rest/initList.json').then(function(response) {
                self.newUser.username = response.data.username;
            }, function(errResponse) {
                alert('Error while fetching notes');
            });
        };   
        init();

        //function to add new Task 
        this.addUser = function(userToAdd) {
            //here can be implemented 'bcrypt'-tion to sign packages with x-auth
            newUserService.addNewUser({
                "first_name" : userToAdd.first_name, 
                "last_name" : userToAdd.last_name,
                "username" : userToAdd.username, 
                "password" : userToAdd.password,
                "task" : userToAdd.task, //'task' is not used for now                
                "phone": userToAdd.phone,
                "position": userToAdd.position,
                "e_mail": userToAdd.e_mail,
                "position": userToAdd.position,
                "monday_from": userToAdd.monday_from,
                "monday_to": userToAdd.monday_to,
                "tuesday_from": userToAdd.tuesday_from,
                "tuesday_to": userToAdd.tuesday_to,
                "wednesday_from": userToAdd.wednesday_from,
                "wednesday_to": userToAdd.wednesday_to,
                "thursday_from": userToAdd.thursday_from,
                "thursday_to": userToAdd.thursday_to,
                "friday_from": userToAdd.friday_from,
                "friday_to": userToAdd.friday_to,
                "saturday_from": userToAdd.saturday_from,
                "saturday_to": userToAdd.saturday_to,
                "sunday_from": userToAdd.sunday_from,
                "sunday_to": userToAdd.sunday_to,
                "task_one": userToAdd.task_one,
                "task_two": userToAdd.task_two,
                "task_three": userToAdd.task_three
            }).then(function(response, err) {
                listOfUsers();
                if (err) {
                    console.error(err); 
                }
            });
            init();
        };
        //function to delete a task
        this.delete = function(_id) {
            var deleteTaskID = {'deleteID': _id};
            newUserService.deleteTask(deleteTaskID).then(function(response, err) {
                listOfUsers();
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
            newUserService.saveTask(scheduleOfTeamArray[toSaveElementNumber]).then(
                function(response) {
                    
                },
                function(err) {
                    alert(err);
                }
            );
        };
    })
    .factory("newUserService", ['$http', '$q', function($http, $q) {
        return {readListOfUsers: function() {
            var res = {
                    method: 'GET',
                    url: '/rest/users'
                };
            return $http(res);              
            }, addNewUser: function(newUser) {
                var req = {
                    method: 'POST',
                    url: '/rest/reg',
                    data: newUser,
                    headers: {'Content-Type': 'application/json'}
                };
                return $http(req);                                                                                                          
            }, deleteTask: function(deleteTaskNumber) {
                var req = {
                    method: 'DELETE',
                    url: '/rest/users/' + deleteTaskNumber.deleteID,
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
            }
        };         
    }]);
