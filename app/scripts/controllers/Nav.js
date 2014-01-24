'use strict';

angular.module('quiverInvoiceApp')
  .controller('NavCtrl', function ($scope, user, userService, $state) {
    var protectedRoutes = ['dashboard', 'settings'];

    $scope.user = user;

    if ($scope.user && $state.current.name === 'root') {
      $state.go('dashboard');
    } else if (!user && ~protectedRoutes.indexOf($state.current.name)) {
      $state.go('root');
    }

    $scope.logOut = function () {
      userService.logOut().then(userService.get).then(function (user) {
        $scope.user = user;
        $state.go('root');
      });
    };



  });
