'use strict';

angular.module('quiverInvoiceApp')
  .service('stripeService', function stripeService($rootScope, $q, Stripe, environmentService, Restangular, cacheService) {
    var cache = cacheService.get();

    var setPK = function () {
      var deferred = $q.defer();
      paramsService.get().then(function (params) {
        deferred.resolve(Stripe.setPublishableKey(params.stripePK));
      });
      return deferred.promise;

    };

    return {
      clearCache: function () {
        cache.remove('/token');
      },
      createToken: function (pk, card) {
        var deferred = $q.defer();

        Stripe.setPublishableKey(pk);
        Stripe.card.createToken(card, function (status, response) {
          var result = { status: status, response: response};

          if (response.error) {
            deferred.reject(result);
          } else {
            deferred.resolve(result);
          }
          $rootScope.$apply(); // Must call $apply() because this callback is outside of Angular
        });

        return deferred.promise;

      },

      getToken: function () {
        return Restangular.one('token').get();
      },

      saveToken: function (userId, invoiceId, token) {
        return Restangular.one('user', userId).one('invoice', invoiceId).all('token').post({token: token});
      },

      removeToken: function (userId, invoiceId, invoice) {
        return Restangular.one('user', userId).one('invoice', invoiceId).all('token').remove();
      },

      pay: function (userId, invoiceId, loggedInUser) {
        return Restangular.one('user', userId).one('invoice', invoiceId).all('pay').post(loggedInUser);
      },

      cardType: Stripe.card.cardType,

      validateCardNumber: Stripe.card.validateCardNumber,

      validateExpiry: Stripe.card.validateExpiry,

      validateCVC: Stripe.card.validateCVC,

      validateMonth: function (month) {
        var month = parseInt(month, 10);
        return month >= 1 && month <= 12;
      }

    };
  });
