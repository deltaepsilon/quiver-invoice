'use strict';

angular.module('quiverInvoiceApp')
  .factory('environmentService', function environmentService($window) {
    var
      Handler = function (deferred) {
        return {
          resolve: function (res) {
            deferred.resolve(res);
          },
          reject: function (err) {
            deferred.reject(err);
          }
        }
      };

    return {
      get: function () {
        return $window.env;
      },

      Handler: Handler
    }
  });
