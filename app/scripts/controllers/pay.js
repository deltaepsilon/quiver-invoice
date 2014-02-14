'use strict';

angular.module('quiverInvoiceApp')
  .controller('PayCtrl', function ($scope, invoice, moment, stripeService, notificationService, invoiceService, $stateParams, $rootScope) {
    var setDefaults = function () {
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
    $scope.years = stripeService.getYears();

    // Set months
    $scope.months = stripeService.getMonths();

    setDefaults();

    $scope.removeToken = function (invoice) {
      stripeService.removeToken($stateParams.userId, $stateParams.invoiceId, $scope.loggedInUser.id, invoice).then(function () {
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
        stripeService.saveToken($scope.loggedInUser.id, $stateParams.userId, $stateParams.invoiceId, res.response).then(function (token) {
          notificationService.success('Credit Card', 'Credit Card Added');
        });
        setDefaults();
      }, function (res) {
        notificationService.error('Credit Card', (res.response) ? res.response.error.message : res.data.message);
      });
    };

    $scope.pay = function () {

      stripeService.pay($stateParams.userId, $stateParams.invoiceId, $rootScope.loggedInUser).then(function () {

        invoiceService.getInvoiceByUser($stateParams.userId, $stateParams.invoiceId).then(function (invoice) {
          $scope.invoice = invoice;

          notificationService.success('Payment', 'Payment complete!');
        }, function (err) {
          notificationService.error('Payment', err.message);
        });



      }, function (res) {
        notificationService.error('Payment', (res.response) ? res.response.error.message : res.data.message);
      });
    };

  });
