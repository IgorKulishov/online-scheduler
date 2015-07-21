angular.module('scheduleOfTeam', ['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider.when('/', {
  //    	template: '<h1>Sign in page</h1>'
        templateUrl: 'code/login/login.html'
 //       controller: 'scheduleController',
 //       controllerAs: 'ctrl'
      })
      .when('/Schedule', {
//      	  template: '<h1>Schedule page</h1>'
        templateUrl: 'code/schedule/schedule.html',
        controller: 'scheduleController',
        controllerAs: 'ctrl'
      })
      .when('/Users', {
  //  	  template: '<h1>Users page</h1>'
          templateUrl: 'code/users/users.html'
  //        controller: 'scheduleController',
  //        controllerAs: 'ctrl'
      })      
      .otherwise({redirectTo: '/Schedule'});
  });