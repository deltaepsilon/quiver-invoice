'use strict';

angular.module('quiverInvoiceApp')
  .service('environmentService', function environmentService(Restangular) {
    return {
      get: function () {
        return Restangular.one('env.json').get();
      }
    }
  });
