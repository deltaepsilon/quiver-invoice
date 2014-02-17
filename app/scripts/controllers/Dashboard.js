'use strict';

angular.module('quiverInvoiceApp')
  .controller('DashboardCtrl', function ($scope, _) {
    console.log('user', $scope.user);
    $scope.percentComplete = 1;

    $scope.user.$on('loaded', function () {
      $scope.percentComplete = 0;
      _.each($scope.user.settings, function (setting) {
        console.log('setting', setting);
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

  });
