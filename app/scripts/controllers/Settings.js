'use strict';

angular.module('quiverInvoiceApp')
  .controller('SettingsCtrl', function ($scope, notificationService) {
    $scope.notify = function (action) {
      action().then(function (res) {
        notificationService.success('Settings', 'Saved');
      }, function (err) {
        notificationService.error('Settings', 'Save failed');
      });
    };
  });
