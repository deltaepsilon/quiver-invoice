'use strict';

angular.module('quiverInvoiceApp')
  .controller('LoginCtrl', function ($scope, userService, notificationService, $state) {
    var MESSAGE_REGEX = /FirebaseSimpleLogin: /,
      cleanMessage = function (message) {
        return message.replace(MESSAGE_REGEX, '');
      },
      forward = function () {
        if ($state.previous && $state.previous.current.name.length > 0) {
          $state.go($state.previous.current.name, $state.previous.params);
        } else {
          $state.go('dashboard');
        }

      };

    $scope.logIn = function (user) {
      var promise = userService.logIn(user);

      promise.then(function (res) {
        forward();
        notificationService.success('Login', 'Log in success!');
      }, function (err) {
        notificationService.error('Login', cleanMessage(err.message));
      });

      return promise;
    };

    $scope.create = function (user) {
      var promise = userService.create(user);

      promise.then(function (res) {
        forward();
        notificationService.success('Login', 'New user created!');
      }, function (err) {
        notificationService.error('Login', cleanMessage(err.message));
      });

      return promise;
    };

    $scope.resetPassword = function (user) {
      var promise = userService.reset(user.email);

      promise.then(function (res) {
        notificationService.success('Login', 'Password reset email sent to ' + user.email);
      }, function (err) {
        notificationService.error('Login', cleanMessage(err.message));
      });

      return promise;
    };
  });
