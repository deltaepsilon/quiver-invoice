'use strict';

angular.module('quiverInvoiceApp')
  .filter('commaDelimited', function () {
    return function (input) {
      if (Array.isArray(input)) {
        return input.join(", ");
      } else {
        return input;
      }
    };
  });
