'use strict';

angular.module('quiverInvoiceApp')
  .controller('LoginCtrl', function ($scope, userService, notificationService) {
    var MESSAGE_REGEX = /FirebaseSimpleLogin: /,
      cleanMessage = function (message) {
        return message.replace(MESSAGE_REGEX, '');
      };

    $scope.logIn = function (user) {
      userService.logIn(user).then(function (res) {
        notificationService.success('Login', 'Log in success!');
      }, function (err) {
        notificationService.error('Login', cleanMessage(err.message));
      });
    };

    $scope.create = function (user) {
      userService.create(user).then(function (res) {
        notificationService.success('Login', 'New user created!');
      }, function (err) {
        notificationService.error('Login', cleanMessage(err.message));
      });
    };

    $scope.resetPassword = function (user) {
      userService.reset(user.email).then(function (res) {
        notificationService.success('Login', 'Password reset email sent to ' + user.email);
      }, function (err) {
        notificationService.error('Login', cleanMessage(err.message));
      });
    };
  });
