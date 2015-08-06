angular.module('scheduleOfTeam')
    .controller("loginController", function(loginService, $http, $rootScope) {
        var self = this;
        var token;
        // function to fill in initial information into login form 
        var init = function() {
            self.username = ""; 
            self.password = "";
        };
        init();
        //function to receive a token
        this.loginUser = function(usernameInfo, passInfo) {
            //here can be implemented 'bcrypt'-tion to sign packages with x-auth
            loginService.loginRestFunc({
                "username" : usernameInfo,
                "password" : passInfo
            }).then(function(response, err) {
                if (err) { console.error(err); }
                if (response.data) {
                    $rootScope.token = response.data;
                    token = $rootScope.token;
                  //  $rootScope.$broadcast('token', response.data);
                } else {
                    self.loginInfo = "Please login or create new profile";
                }
            });
            init();
        };
        this.logout = function() {
            loginService.logout(token).then(
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
    .factory("loginService", ['$http', '$q', function($http, $q) {
        return {loginRestFunc: function(newUser) {
                var req = {
                    method: 'POST',
                    url: '/rest/auth',
                    data: newUser,
                    headers: {'Content-Type': 'application/json'}
                };
                return $http(req);
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