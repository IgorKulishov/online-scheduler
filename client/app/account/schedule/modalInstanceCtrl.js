'use strict';

//controller for modal
angular.module('schedulerApp').controller('modalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
      item: $scope.items[0]
  };

  $scope.answer = function (answer) {      
      $modalInstance.close(answer);
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
});
