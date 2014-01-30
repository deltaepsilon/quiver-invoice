'use strict';

angular.module('quiverInvoiceApp')
  .factory('environmentService', function environmentService(Restangular, $q) {
    var envDeferred = $q.defer(),
      env = envDeferred.promise,
      Handler = function (deferred) {
        return {
          resolve: function (res) {
            deferred.resolve(res);
          },
          reject: function (err) {
            deferred.reject(err);
          }
        }
      },
      envDependentFunction = function (action) {
        var deferred = $q.defer(),
          handler = new Handler(deferred);
        env.then(function (env) {
          action(handler, env);
        });
        return deferred.promise;
      };

    return {
      get: function () {
        var deferred = $q.defer();
        deferred.resolve(window.env);
        return deferred.promise;
      },

      deferred: envDeferred,

      Handler: Handler,

      envDependentFunction: envDependentFunction
    }
  });
