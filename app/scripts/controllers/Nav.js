'use strict';

angular.module('quiverInvoiceApp')
  .controller('NavCtrl', function ($rootScope, $scope, user, loggedInUser, userService, $state) {
    var protectedRoutes = ['dashboard', 'settings'];

    $rootScope.user = user;
    $rootScope.loggedInUser = loggedInUser;

    if ($rootScope.user && $state.current.name === 'root') {
      $state.go('dashboard');
    } else if (!user && ~protectedRoutes.indexOf($state.current.name)) {
      $state.go('root');
    }

    $scope.logOut = function () {
      userService.logOut().then(userService.get).then(function (user) {
        $rootScope.user = user;
        $state.go('root');
      });
    };



  });
