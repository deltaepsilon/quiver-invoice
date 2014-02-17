'use strict';

angular.module('quiverInvoiceApp')
  .filter('percentage', function () {
    return function (input, decimals) {
      var decimals = Math.max(0, parseInt(decimals || 0, 10)),
        value = input * 100 * Math.pow(10, decimals);
      value = Math.round(value);
      if (decimals) {
        value = value / Math.pow(10, decimals);
      }

      return value + "%";
    };
  });
