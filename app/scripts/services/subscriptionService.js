'use strict';

angular.module('quiverInvoiceApp')
  .service('subscriptionService', function subscriptionService($q, userService) {

    return {
      saveToken: function (token) {
        var deferred = $q.defer();

        userService.getRef().then(function (userRef) {
          userRef.$child('subscription').$child('token').$set(token).then(function (res) {
            deferred.resolve(res);
          });
        });

        return deferred.promise;
      },

      removeToken: function () {
        var deferred = $q.defer();

        userService.getRef().then(function (userRef) {
          userRef.$child('subscription').$remove('token').then(function (res) {
            deferred.resolve(res);
          });
        });

        return deferred.promise;
      }
    }
  });
