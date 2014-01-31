'use strict';

angular.module('quiverInvoiceApp')
  .service('invoiceService', function invoiceService($q, $firebase, environmentService, userService, notificationService, $state, Restangular) {
    var env = environmentService.get(),
      getNextInvoiceNumber = function () {
        var deferred = $q.defer(),
          invoicesRef,
          increment = function () {
          if (!invoicesRef.next) {
            invoicesRef.next = 100;
          }

          deferred.resolve(invoicesRef.next);
          invoicesRef.next += 1;
          invoicesRef.$save();
        };

        service.get().then(function (res) {
          invoicesRef = res;
          if (!invoicesRef.next) {
            invoicesRef.$on('loaded', function () {
              increment();
            });
          } else {
            increment();
          }
        });

        return deferred.promise;
      };

    var service = {
      newInvoice: function () {
        var deferred = $q.defer();

        getNextInvoiceNumber().then(function (next) {
          deferred.resolve({
            date: moment().format('YYYY-MM-DD'),
            number: next,
            project: null,
            address: null,
            items: []
          });
        });

        return deferred.promise;
      },

      get: function (id) {
        var deferred = $q.defer();

        userService.getCurrentUser().then(function (user) {
          var path = env.firebase + '/users/' + user.id + '/invoices';
          if (id) {
            path += '/' + id;

          }
          deferred.resolve($firebase(new Firebase(path)));
        });

        return deferred.promise;
      },

      create: function (invoice, copy) {
        invoice.state = 'created';

        var deferred = $q.defer(),
          promise = notificationService.promiseNotify('Invoice', 'Invoice created', 'Invoice creation failed', function () {
            service.get().then(function (invoicesRef) {
              if (copy) {
                getNextInvoiceNumber().then(function (next) {
                  invoice.number = next;
                  invoicesRef.$add(invoice).then(deferred.resolve);
                });
              } else {
                invoicesRef.$add(invoice).then(deferred.resolve);
              }


            });

            return deferred.promise;
          });

        promise.then(function (res) {
          $state.go('dashboard');
        });

        return deferred.promise;

      },

      remove: function (id) {
        var deferred = $q.defer(),
          promise = notificationService.promiseNotify('Invoice', 'Invoice deleted', 'Deletion failed', function () {
            service.get(id).then(function (invoice) {
              invoice.$remove().then(deferred.resolve);
            });
            return deferred.promise;
          });

        promise.then(function () {
          $state.go('dashboard');
        });

        return deferred.promise;

      },

      send: function (loggedInUser, invoiceId) {
        return Restangular.one('user', loggedInUser.id).one('invoice', invoiceId).all('send').post(loggedInUser);
      }
    };

    return service;

  });
