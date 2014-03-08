'use strict';

angular.module('quiverInvoiceApp')
  .controller('DashboardCtrl', function ($scope, $rootScope, $q, _, notificationService, invoiceService, stripeService, userService, moment, $timeout) {
    $scope.percentComplete = 1;

    $scope.isTest = stripeService.isTest;

    $scope.user.$on('loaded', function () {
      $scope.percentComplete = 0;
      _.each($scope.user.settings, function (setting) {
        _.each(setting, function (attribute) {
          if (attribute) {
            $scope.percentComplete += 1/9
          }
        });
      });
    });

    $scope.filteredInvoices = function (text, invoices) {
      if (!invoices) {
        return {};
      }

      if (!text) {
        return invoices;
      }

      var text = text.toLowerCase(),
        regex = new RegExp(text, 'i'),
        keys = Object.keys(invoices),
        i = keys.length,
        result = {},
        invoice,
        flagged;

      while (i--) {
        invoice = invoices[keys[i]];

        if (invoice.details) {

          flagged = false;

          if (!flagged && invoice.details.project.match(regex)) {
            flagged = true;
          }

          if (!flagged && invoice.details.recipient) {
            if (invoice.details.recipient.address && invoice.details.recipient.address.match(regex)) {
              flagged = true;
            } else if (invoice.details.recipient.email && invoice.details.recipient.email.match(regex)) {
              flagged = true;
            } else if (invoice.details.recipient.name && invoice.details.recipient.name.match(regex)) {
              flagged = true;
            }
          }

          if (!flagged && invoice.details.state && invoice.details.state.match(regex)) {
            flagged = true;
          }

          if (!flagged && invoice.details.tags && invoice.details.tags.join(' ').match(regex)) {
            flagged = true;
          }

          if (flagged) {
            result[keys[i]] = invoice;
          }

        }
      }

      return result;
    };

    var parseTags = function (ref, tags) {
      var tagsArray = (tags) ? tags.split(",") : [],
        i = tagsArray.length;

      while (i--) {
        tagsArray[i] = tagsArray[i].trim();
      }

      if (ref.details) {
        ref.details.tags = tagsArray;
      } else {
        console.log('details not found', ref, tagsArray);
      }
      return ref;
    };

    $scope.saveTags = function (id, tags) {
      invoiceService.get(id).then(function (invoice) {
        var deferred = $q.defer();

        invoice.$on('loaded', function () {
          parseTags(invoice, tags);
          invoice.$save().then(deferred.resolve, deferred.reject);
        });

        return deferred.promise;
      }).then(function () {
          notificationService.success('Invoice', 'Changes saved');
      }, function (err) {
          notificationService.error('Invoice', err);
      });
    };

    $scope.savePaymentTags = function (id, tags) {
      invoiceService.getPayments(id).then(function (invoice) {
        var deferred = $q.defer();

        invoice.$on('loaded', function () {
          parseTags(invoice, tags);
          invoice.$save().then(deferred.resolve, deferred.reject);
        });

        return deferred.promise;
      }).then(function () {
          notificationService.success('Invoice', 'Changes saved');
        }, function (err) {
          notificationService.error('Invoice', err);
        });
    };

    $scope.setFilterText = function (text) {
      $scope.invoiceFilterText = text;
    };

    $scope.setPaymentText = function (text) {
      $scope.paymentFilterText = text;
    };

    $scope.markAsPaid = function (id) {
      invoiceService.get(id).then(function (invoice) {
        invoice.$child('details').$child('state').$set('paid').then(function () {
          notificationService.success('Invoice', 'Marked as paid');
          userService.get().then(function (user) {
            $rootScope.user = user;
          });
        }, function (err) {
          notificationService.error('Invoice', err);
        });
      });
    };

    $scope.addNote = function (invoiceId) {
      userService.getRef().then(function (userRef) {
        userRef.$child('invoices').$child(invoiceId).$child('details').$child('notes').$add({text: "Edit this note...", date: moment().format("YYYY-MM-DD")});
      });

    };

    $scope.updateNote = function (invoiceId, noteId, note) {
      $timeout(function () {
        userService.getRef().then(function (userRef) {
          note.date = moment().format("YYYY-MM-DD");
          userRef.$child('invoices').$child(invoiceId).$child('details').$child('notes').$child(noteId).$set(note);
        });
      });

    };

  });
