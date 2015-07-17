angular.module('scheduleOfTeam', [])
    .controller("scheduleController", function(jsonService, $http) {
       // var idGenerator = 0; is not used
        var self = this;
        var message = [];
        self.taskListArray = [];
        var enteredMonth = 5;
        var enteredDay = 22;
        var enteredYear = 2015;
        
        //function to read 'list' array of tasks from file in data folder           
        var taskListArrayRead = function(month, day,  year) {
            jsonService.readList(month, day, year).then(function(response) {
                self.taskListArray = response.data;    
                //need to add  function to find bigest 'id' number from array to replace idGenerator=1 number            
            }, function(errResponse) {
                    for (var key in errResponse)
                        alert(' Error while fetching notes ' + errResponse[key]);
                }
            );
        };
        taskListArrayRead();
        
        this.chooseDate = function(date) {            
            taskListArrayRead(date.month, date.day, date.year);   
            enteredMonth = date.month;
            enteredDay = date.day;
            enteredYear = date.year;
        };   

        // function to fill in initial information into the "add new task" form from 'txt' file
        var init = function() {
            self.newTask = {};
            self.newTask.name;
            self.newTask.priority;
            self.newTask.type;
            self.booleanProgress;
            self.newTask.percentageMessage;
            self.newTask.isEditing = false;
            
            //presentation object is in data/TaskList.txt file
            $http.get('rest/initList.json').then(function(response) {
                self.newTask.name = response.data.name;
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
            $http.get('key/identifkey.json').then(function(response) {
                var identKey = response.data.identKey;
                jsonService.addNewTask({                
                    "id": 0, "name" : taskToAdd.name, "start" : taskToAdd.start, "break1" : taskToAdd.break1, 
                    "lunch" : taskToAdd.lunch, "break2" : taskToAdd.break2, "finish" : taskToAdd.finish, "task" : taskToAdd.task,
                    "day": enteredDay, "month": enteredMonth, "year": enteredYear
                }, identKey);      
                alert(enteredDay + enteredMonth + enteredYear);
                taskListArrayRead();      
                init();        
            }, function(errResponse) {
                alert('Error while fetching notes')
            });
        };
        //function to delete a task
        this.delete = function(id) {          
            var deleteTaskID = {'deleteID': id};
            return jsonService.deleteTask(deleteTaskID);
        };
        //this function is to edit a Task
        this.edit = function(id) {                        
            alert(id);
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i].id == id)
                    this.taskListArray[i].isEditing = true;
            }            
        };
        //this function is to Save edited Task
        this.save = function(id) {
            for (var i = 0; i < this.taskListArray.length; i++) {
                if (this.taskListArray[i].id == id) {
                    this.taskListArray[i].isEditing = false;
                    delete this.taskListArray[i].isEditing;
                    return jsonService.saveTask(this.taskListArray[i]);
                }
            }
        };
        //to indicate Progress of a Boolean in a Task when clicked [v] button in user's menu to change Progress of a Task            
        this.booleanCheck = function(id) {
            alert(id);
            var checkedId = {'id': id};
            jsonService.changeProgressInfo(checkedId).then(function(response) {
                alert(response.data);
            });
        };
    })
    .factory("jsonService", function($http) {
        //array of tasks in service 
        //  var list;
        //return array to controller and than to "todoListController" in html
        return {readList: function(month, day, year) {
            var res = {
                    method: 'GET',                    
                    url: 'http://localhost:3000/rest/todo/' + month + '/' + day + '/' + year
                };                           
            return $http(res);              
            }, addNewTask: function(newTask, ident_Key) {
                var req = {
                    method: 'POST',
                    url: 'http://localhost:3000/rest/todo',
                    data: newTask,
                    headers: {'Content-Type': 'application/json', 'x-auth': ident_Key}
                };
                $http(req);                                                                                                          
            }, deleteTask: function(deleteTaskNumber) {
                var req = {
                    method: 'DELETE',
                    url: 'http://localhost:3000/rest/todo/' + deleteTaskNumber.deleteID,                                    
                    headers: {'Content-Type': 'application/json'}
                };
                  
                $http(req);                
            }, saveTask: function(saveTask) {
                var req = {
                    method: 'PUT',
                    url: 'http://localhost:3000/rest/todo/' + saveTask.id,
                    data: saveTask,                    
                    headers: {'Content-Type': 'application/json'}
                };
                $http(req);  
            }, changeProgressInfo: function(CheckById) {

            var res = {
                    method: 'PUT',                    
                    url: 'http://localhost:3000/rest/todo/checkid',
                    data: CheckById,
                    headers: { "Content-Type": 'application/json' }
                };  
                alert(res.data.id);
            return $http(res);                
            }
        };         
    });
