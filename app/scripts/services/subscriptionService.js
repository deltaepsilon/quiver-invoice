'use strict';

angular.module('quiverInvoiceApp')
  .service('subscriptionService', function subscriptionService($q, userService, Restangular, Stripe, environmentService) {
    var env = environmentService.get();

    return {
      get: function () {
        var deferred = $q.defer();

        userService.getCurrentUser().then(function (loggedInUser) {
          Restangular.one('user', loggedInUser.id).one('subscription').get().then(deferred.resolve, deferred.reject);
        });

        return deferred.promise;
      },

      getPlans: function () {
        return Restangular.all('plan').getList();
      },

      saveToken: function (userId, token) {
        var deferred = $q.defer();

        userService.getRef().then(function (userRef) {
          userRef.$child('subscription').$child('token').$set(token).then(function (setRes) {
            Restangular.one('user', userId).all('customer').post(token).then(function (res) {
              deferred.resolve(res);
            });

          }, deferred.reject);
        }, deferred.reject);

        return deferred.promise;
      },

      removeToken: function () {
        var deferred = $q.defer();

        userService.getRef().then(function (userRef) {
          userRef.$child('subscription').$remove('token').then(function (res) {
            deferred.resolve(res);
          });

        }, deferred.reject);

        return deferred.promise;
      },

      createSubscription: function (userId, planId, coupon) {
        return Restangular.one('user', userId).one('plan', planId).post(null, { coupon: coupon });
      },

      cancelSubscription: function (userId) {
        return Restangular.one('user', userId).one('subscription').remove();
      }

    }
  });
