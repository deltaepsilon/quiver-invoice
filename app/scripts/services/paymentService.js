'use strict';

angular.module('quiverInvoiceApp')
  .service('paymentService', function paymentService(environmentService, userService, $q, $firebase) {
    var env = environmentService.get();

    return {
      get: function (id) {
        var deferred = $q.defer();

        userService.getCurrentUser().then(function (user) {
          var path = env.firebase + '/users/' + user.id + '/payments';
          if (id) {
            path += '/' + id;

          }
          deferred.resolve($firebase(new Firebase(path)));
        });

        return deferred.promise;
      }
    }
  });
