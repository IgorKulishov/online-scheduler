angular.module('scheduleOfTeam', ['ngRoute', 'ngWebsocket'])
 .run(function ($websocket, $rootScope) {
        var ws = $websocket.$new('ws://localhost:3003'); // instance of ngWebsocket, handled by $websocket service

        ws.$on('$open', function () {
            console.log('Oh my gosh, websocket is really open! awesome!');

        });

        ws.$on('$message', function(data) {
            if (data.data != 'favicon.ico')
                $rootScope.$broadcast(data.topic, data.data);

            if (data.topic === "new_post") {
                console.log(data);
            } else {
                console.log('other topic : ' + data.topic);
            }
        });

        ws.$on('pong', function (data) {
            console.log('The websocket server has sent the following data:');
            console.log(data);

            ws.$close();
        });
})
.config(function ($routeProvider) {
    $routeProvider.when('/', {
  //    	template: '<h1>Sign in page</h1>'
        templateUrl: 'code/login/login.html',
        controller: 'loginController',
        controllerAs: 'logContr'
      })
      .when('/Schedule', {
//      	  template: '<h1>Schedule page</h1>'
        templateUrl: 'code/schedule/schedule.html',
        controller: 'scheduleController',
        controllerAs: 'ctrl'
      })
      .when('/Users', {
  //  	  template: '<h1>Users page</h1>'
          templateUrl: 'code/users/users.html',
          controller: 'newUserController',
          controllerAs: 'userCtrl'
      })
      .otherwise({redirectTo: '/'});
  });