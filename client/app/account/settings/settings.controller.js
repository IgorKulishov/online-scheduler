'use strict';

angular.module('schedulerApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {

    var today = new Date();
    //set Monday
    var mondayStart = today.getHours()*60;
    var mondayFinish = today.getHours()*60;
    //set Tuesday
    var tuesdayStart = today.getHours()*60;
    var tuesdayFinish = today.getHours()*60;
    //set Wednesday
    var wednesdayStart = today.getHours()*60;
    var wednesdayFinish = today.getHours()*60;
    //set Thursday
    var thursdayStart = today.getHours()*60;
    var thursdayFinish = today.getHours()*60;
    //set Friday
    var fridayStart = today.getHours()*60;
    var fridayFinish = today.getHours()*60;
    //set Saturday
    var saturdayStart = today.getHours()*60;
    var saturdayFinish = today.getHours()*60;
    //set Sunday
    var sundayStart = today.getHours()*60;
    var sundayFinish = today.getHours()*60;


    //Monday
    $scope.mondayStart = function () {
        mondayStart = $scope.user.mondayFrom.getHours()*60 + $scope.user.mondayFrom.getMinutes();
    };
    $scope.mondayFinish = function () {
        mondayFinish = $scope.user.mondayTo.getHours()*60 + $scope.user.mondayTo.getMinutes();
    };
    //Tuesday
    $scope.tuesdayStart = function () {
        tuesdayStart = $scope.user.tuesdayFrom.getHours()*60 + $scope.user.tuesdayFrom.getMinutes();
    };
    $scope.tuesdayFinish = function () {
        tuesdayFinish = $scope.user.tuesdayTo.getHours()*60 + $scope.user.tuesdayTo.getMinutes();
    };
    //Wednesday
    $scope.wednesdayStart = function () {
        wednesdayStart = $scope.user.wednesdayFrom.getHours()*60 + $scope.user.wednesdayFrom.getMinutes();
    };
    $scope.wednesdayFinish = function () {
        wednesdayFinish = $scope.user.wednesdayTo.getHours()*60 + $scope.user.wednesdayTo.getMinutes();
    };
    //Thursday
    $scope.thursdayStart = function () {
        thursdayStart = $scope.user.thursdayFrom.getHours()*60 + $scope.user.thursdayFrom.getMinutes();
        
    };
    $scope.thursdayFinish = function () {
        thursdayFinish = $scope.user.thursdayTo.getHours()*60 + $scope.user.thursdayTo.getMinutes();
        
    };

    //Friday
    $scope.fridayStart = function () {
        fridayStart = $scope.user.fridayFrom.getHours()*60 + $scope.user.fridayFrom.getMinutes();
    };
    $scope.fridayFinish = function () {
        fridayFinish = $scope.user.fridayTo.getHours()*60 + $scope.user.fridayTo.getMinutes();
    };

    //Saturday
    $scope.saturdayStart = function () {
        saturdayStart = $scope.user.saturdayFrom.getHours()*60 + $scope.user.saturdayFrom.getMinutes();
    };
    $scope.saturdayFinish = function () {
        saturdayFinish = $scope.user.saturdayTo.getHours()*60 + $scope.user.saturdayTo.getMinutes();
    };

    //Sunday
    $scope.sundayStart = function () {
        sundayStart = $scope.user.sundayFrom.getHours()*60 + $scope.user.sundayFrom.getMinutes();
    };
    $scope.saturdayFinish = function () {
        sundayFinish = $scope.user.sundayTo.getHours()*60 + $scope.user.surndayTo.getMinutes();
    };

    $scope.errors = {};

    $scope.changePassword = function(form, user) {
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
      console.log(userProperties.name + ' / ' + sundayStart/60 + ' / ' + sundayFinish/60);
		};
  });
