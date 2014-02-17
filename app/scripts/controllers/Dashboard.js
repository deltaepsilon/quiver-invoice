'use strict';

angular.module('quiverInvoiceApp')
  .controller('DashboardCtrl', function ($scope, _) {
    console.log('user', $scope.user);
    $scope.percentComplete = .22222;

    _.each($scope.user.settings, function (setting) {
      console.log('setting', setting);
    });
  });
