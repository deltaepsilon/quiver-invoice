'use strict';

angular.module('quiverInvoiceApp')
  .controller('SettingsCtrl', function ($scope, notificationService) {
    $scope.notify = function (action) {
      notificationService.promiseNotify('Settings', 'Saved', 'Save failed', action);
    };
  });
