'use strict';

angular.module('schedulerApp')
    .factory('scheduleService', ['$http', '$q', '$websocket', '$rootScope', function($http, $q, $websocket, $rootScope) {
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
            }, wsMessage: function() {
 /*               var wsConnection = new WebSocket('ws://team-scheduler.herokuapp.com');
                wsConnection.onmessage = function(e) {

                    var wsData = JSON.parse(e.data).data;
                    console.log(wsData.username);                    
                    $rootScope.$broadcast('rootScope:broadcast', wsData);                    
                };
                */
            }
        };
    }]);