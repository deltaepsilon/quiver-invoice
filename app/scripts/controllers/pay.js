'use strict';

angular.module('quiverInvoiceApp')
  .controller('PayCtrl', function ($scope, invoice) {
    $scope.invoice = invoice;
  });
