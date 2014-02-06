'use strict';

angular.module('quiverInvoiceApp')
  .filter('unix', function (moment) {
    return function (input) {
      return moment.unix(input).format();
    };
  });
