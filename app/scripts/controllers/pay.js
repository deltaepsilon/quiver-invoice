'use strict';

angular.module('quiverInvoiceApp')
  .controller('PayCtrl', function ($scope, invoice, moment, stripeService, notificationService, invoiceService, $stateParams) {
    var i = 10,
      year = moment().year(),
      setDefaults = function () {
        $scope.newCard = {
          exp_year: $scope.years[0],
          exp_month: 0
        };

        if ($scope.cardForm) {
          $scope.cardForm.$pristine = true;
          $scope.cardForm.$dirty = false;
          $scope.cardForm.number.$pristine = true;
          $scope.cardForm.number.$dirty = false;
          $scope.cardForm.cvc.$pristine = true;
          $scope.cardForm.cvc.$dirty = false;
          $scope.cardForm.month.$pristine = true;
          $scope.cardForm.month.$dirty = false;
        }

      };
    


    $scope.invoice = invoice;

    // Set years
    $scope.years = [];
    while (i--) {
      $scope.years.unshift(i + year);
    }

    // Set months
    $scope.months = ['Expiration Month', 'January (1)', 'February (2)', 'March (3)', 'April (4)', 'May (5)', 'June (6)', 'July (7)', 'August (8)', 'September (9)', 'October (10)', 'November (11)', 'December (12)'];

    setDefaults();

    $scope.removeToken = function (invoice) {
      stripeService.removeToken($stateParams.userId, $stateParams.invoiceId, invoice).then(function () {
        notificationService.success('Credit Card', 'Credit Card Deleted');
      });
    },

    $scope.validateCardNumber = function (number) {
      $scope.cardForm.number.$invalid = !stripeService.validateCardNumber(number);
    };

    $scope.validateCVC = function (cvc) {
      $scope.cardForm.cvc.$invalid = !stripeService.validateCVC(cvc);
    };

    $scope.validateMonth = function (month) {
      $scope.cardForm.month.$invalid = !stripeService.validateMonth(month);
    };

    $scope.createToken = function (invoice, card) {
      stripeService.clearCache();
      stripeService.createToken(invoice.details.sender.pk, card).then(function (res) {
        stripeService.saveToken($stateParams.userId, $stateParams.invoiceId, res.response).then(function (token) {
          notificationService.success('Credit Card', 'Credit Card Added');
        });
        setDefaults();
      }, function (res) {
        notificationService.error('Credit Card', res.response.error.message);
      });
    };

    $scope.pay = function () {
      stripeService.pay($stateParams.userId, $stateParams.invoiceId).then(function () {
        notificationService.success('Payment', 'Payment complete!');
        $scope.invoice = invoiceService.get($stateParams.invoiceId);
      }, function (res) {
        notificationService.error('Payment', res.response.error.message);
      });
    };

  });
