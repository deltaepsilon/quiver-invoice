'use strict';

angular.module('quiverInvoiceApp')
  .service('stripeService', function stripeService($rootScope, $q, Stripe, Restangular, cacheService, moment) {
    var cache = cacheService.get(),
      year = moment().year();

    console.log('env', env);

    return {
      clearCache: function () {
        cache.remove('/token');
      },

      getMonths: function () {
        return ['Expiration Month', 'January (1)', 'February (2)', 'March (3)', 'April (4)', 'May (5)', 'June (6)', 'July (7)', 'August (8)', 'September (9)', 'October (10)', 'November (11)', 'December (12)'];
      },

      getYears: function () {
        var years = [],
          i = 10;

        while (i--) {
          years.unshift(i + year);
        }

        return years;
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
