'use strict';

angular.module('schedulerApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {

    var timeStart = new Date();
    var timeFinish = new Date();

    //default start time for days
    timeStart.setHours(6);
    timeStart.setMinutes(0);
    //default finish time for days
    timeFinish.setHours(23);
    timeFinish.setMinutes(0);

    //set Monday
    var mondayStart = timeStart;
    var mondayFinish;
    //set Tuesday
    var tuesdayStart = timeStart;
    var tuesdayFinish;
    //set Wednesday
    var wednesdayStart;
    var wednesdayFinish;
    //set Thursday
    var thursdayStart;
    var thursdayFinish;
    //set Friday
    var fridayStart;
    var fridayFinish;
    //set Saturday
    var saturdayStart;
    var saturdayFinish;
    //set Sunday
    var sundayStart;
    var sundayFinish;
    
    //Monday
    $scope.userMondayFrom = timeStart;
    $scope.userMondayTo = timeFinish;
    $scope.mondayStart = function () {
        mondayStart = $scope.userMondayFrom;
    };
    $scope.mondayFinish = function () {
        mondayFinish = $scope.userMondayTo.getHours()*60 + $scope.userMondayTo.getMinutes();
    };
    //Tuesday
    $scope.userTuesdayFrom = timeStart;
    $scope.userTuesdayTo = timeFinish;
    $scope.tuesdayStart = function () {
        tuesdayStart = $scope.userTuesdayFrom.getHours()*60 + $scope.userTuesdayFrom.getMinutes();        
    };
    $scope.tuesdayFinish = function () {
        tuesdayFinish = $scope.userTuesdayTo.getHours()*60 + $scope.userTuesdayTo.getMinutes();        
    };
    //Wednesday
    $scope.userWednesdayFrom = timeStart;
    $scope.userWednesdayTo = timeFinish;
    $scope.wednesdayStart = function () {
        wednesdayStart = $scope.userWednesdayFrom.getHours()*60 + $scope.userWednesdayFrom.getMinutes();        
    };
    $scope.wednesdayFinish = function () {
        wednesdayFinish = $scope.userWednesdayTo.getHours()*60 + $scope.userWednesdayTo.getMinutes();        
    };
    //Thursday
    $scope.userThursdayFrom = timeStart;
    $scope.userThursdayTo = timeFinish;
    $scope.thursdayStart = function () {
        thursdayStart = $scope.userThursdayFrom.getHours()*60 + $scope.userThursdayFrom.getMinutes();
        
    };
    $scope.thursdayFinish = function () {
        thursdayFinish = $scope.userThursdayTo.getHours()*60 + $scope.userThursdayTo.getMinutes();
        
    };

    //Friday
    $scope.userFridayFrom = timeStart;
    $scope.userFridayTo = timeFinish;
    $scope.fridayStart = function () {
        fridayStart = $scope.userFridayFrom.getHours()*60 + $scope.userFridayFrom.getMinutes();
    };
    $scope.fridayFinish = function () {
        fridayFinish = $scope.userFridayTo.getHours()*60 + $scope.userFridayTo.getMinutes();
    };

    //Saturday
    $scope.userSaturdayFrom = timeStart;
    $scope.userSaturdayTo = timeFinish;
    $scope.saturdayStart = function () {
        saturdayStart = $scope.userSaturdayFrom.getHours()*60 + $scope.userSaturdayFrom.getMinutes();
    };
    $scope.saturdayFinish = function () {
        saturdayFinish = $scope.userSaturdayTo.getHours()*60 + $scope.userSaturdayTo.getMinutes();
    };

    //Sunday
    $scope.userSundayFrom = timeStart;
    $scope.userSundayTo = timeFinish;
    $scope.sundayStart = function () {
        sundayStart = $scope.userSundayFrom.getHours()*60 + $scope.userSundayFrom.getMinutes();
    };
    $scope.saturdayFinish = function () {
        sundayFinish = $scope.userSundayTo.getHours()*60 + $scope.userSurndayTo.getMinutes();
    };

    $scope.errors = {};

    $scope.submitInfo = function(form, user) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
      //temporary constraction;
      //userProperties should send info to server to save information;
      var userProperties = {
          'userName': user.userName,
          'name': user.name,
          'lastName': user.lastName,
          'email': user.email,
          'position': user.position,
          'mondayFrom': mondayStart
      };
      alert(userProperties.name + ' starts ' + mondayStart.getHours() + ':' + mondayStart.getMinutes());
		};
  });
