'use strict';

angular.module('quiverInvoiceApp')
  .service('invoiceService', function invoiceService($q, $firebase, environmentService, userService, notificationService, $state) {
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
      },
      invoicesRef,
      getNextInvoiceNumber = function () {
        var increment = function (handler) {
          if (!invoicesRef.next) {
            invoicesRef.next = 100;
          }

          handler.resolve(invoicesRef.next);
          invoicesRef.next += 1;
          invoicesRef.$save();
        };

        return envDependentFunction(function (envHandler) {
          if (!invoicesRef.next) {
            invoicesRef.$on('loaded', function () {
              increment(envHandler);
            });
          } else {
            increment(envHandler);
          }

        });
      };

    environmentService.get().then(function (env) {
      userService.getCurrentUser().then(function (user) {
        invoicesRef = $firebase(new Firebase(env.firebase + '/users/' + user.id + '/invoices'));
        envDeferred.resolve(env);
      });

    });

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
        return envDependentFunction(function (handler) {
          handler.resolve(id ? invoicesRef.$child(id) : invoicesRef);
        });
      },

      create: function (invoice, copy) {
        invoice.state = 'created';

        var deferred = $q.defer(),
          promise = notificationService.promiseNotify('Invoice', 'Invoice created', 'Invoice creation failed', function () {
            invoicesRef.$add(invoice).then(deferred.resolve);
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
//              invoicesRef.$remove(key).then(deferred.resolve);
            });
            return deferred.promise;
          });

        promise.then(function () {
          $state.go('dashboard');
        });

        return deferred.promise;

      }
    };

    return service;

  });
