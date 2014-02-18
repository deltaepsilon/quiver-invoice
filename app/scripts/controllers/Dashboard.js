'use strict';

angular.module('quiverInvoiceApp')
  .controller('DashboardCtrl', function ($scope, $q, _, notificationService, invoiceService) {
    $scope.percentComplete = 1;

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

    $scope.filteredInvoices = function (text) {
      if (!$scope.user.invoices) {
        return {};
      }

      if (!text) {
        return $scope.user.invoices;
      }

      var text = text.toLowerCase(),
        regex = new RegExp(text, 'i'),
        invoices = $scope.user.invoices,
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

    $scope.saveTags = function (id, tags) {
      invoiceService.get(id).then(function (invoice) {
        var deferred = $q.defer();

        invoice.$on('loaded', function () {
          var tagsArray = (tags) ? tags.split(",") : [],
            i = tagsArray.length;

          while (i--) {
            tagsArray[i] = tagsArray[i].trim();
          }

          if (invoice.details) {
            invoice.details.tags = tagsArray;
          } else {
            console.log('details not found', invoice, tagsArray);
          }

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

    $scope.$on('tagsInput', function () {
      console.log('tagsInput changed', this, arguments);
    });

  });
