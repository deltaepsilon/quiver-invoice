'use strict';

angular.module('quiverInvoiceApp')
  .controller('SettingsCtrl', function ($scope, notificationService) {
    $scope.notify = function (action) {
      return notificationService.promiseNotify('Settings', 'Saved', 'Save failed', action);
    };
  });
