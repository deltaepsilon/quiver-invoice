'use strict';

angular.module('quiverInvoiceApp')
  .service('settingsService', function settingsService($q, $firebase, environmentService) {
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
          action(handler);
        });
        return deferred.promise;
      },
      settingsRef;

    environmentService.get().then(function (env) {
      settingsRef = $firebase(new Firebase(env.firebase + '/settings'));
      envDeferred.resolve(env);
    });

    return {
      get: function () {
        return envDependentFunction(function (handler) {
          handler.resolve(settingsRef);
        });
      },

      create: function (settings) {
        return envDependentFunction(function (handler) {
          settings.$add(settings);
          handler.resolve(settingsRef);
        });
      }
    }
  });
