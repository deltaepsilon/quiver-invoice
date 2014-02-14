'use strict';

angular.module('quiverInvoiceApp')
  .service('invoiceService', function invoiceService($q, $firebase, environmentService, userService, notificationService, $state, Restangular, $rootScope) {
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

        userService.get().then(function (user) {
          getNextInvoiceNumber().then(function (next) {
            user.$on('loaded', function () {
              var name,
                email,
                address;

              if (user.settings && user.settings.company) { // Acts as a null check
                name = user.settings.company.name;
                address = user.settings.company.address;
              }

              if (user.settings && user.settings.contact) { // Acts as a null check
                email = user.settings.contact.email;
              }

              deferred.resolve({
                details: {
                  date: moment().format('YYYY-MM-DD'),
                  number: next,
                  project: null,
                  sender: {
                    name: name,
                    email: email,
                    address: address
                  },
                  recipient: {},
                  items: []
                }
              });
            });

          });
        });

        return deferred.promise;
      },

      getInvoiceByUser: function (userId, invoiceId) {
        var deferred = $q.defer(),
          detailsRef = $firebase(new Firebase(env.firebase + '/users/' + userId + '/invoices/' + invoiceId + '/details')),
          chargeRef = $firebase(new Firebase(env.firebase + '/users/' + userId + '/invoices/' + invoiceId + '/charge'));

        deferred.resolve({details: detailsRef, charge: chargeRef});


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
        invoice.details.state = 'created';

        return notificationService.promiseNotify('Invoice', 'Invoice created', 'Invoice creation failed', function () {
          var deferred = $q.defer();

          service.get().then(function (invoicesRef) {
            if (copy) {
              getNextInvoiceNumber().then(function (next) {
                invoice.details.number = next;
                delete invoice.charge;
                delete invoice.sk;
                delete invoice.details.token;
                invoicesRef.$add(invoice).then(deferred.resolve, deferred.reject);
              });
            } else {
              invoicesRef.$add(invoice).then(deferred.resolve, deferred.reject);
            }
          });


          return deferred.promise;
        });

      },

      remove: function (id) {
        return notificationService.promiseNotify('Invoice', 'Invoice deleted', 'Deletion failed', function () {
          var deferred = $q.defer();

          service.get(id).then(function (invoice) {
            invoice.$remove().then(deferred.resolve, deferred.reject);

          });
          return deferred.promise;
        });

      },

      send: function (loggedInUser, invoiceId) {
        return notificationService.promiseNotify('Email', 'Invoice Sent', 'Invoice failed to send', Restangular.one('user', loggedInUser.id).one('invoice', invoiceId).all('send').post, [loggedInUser]);
      }
    };

    return service;

  });
