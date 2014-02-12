'use strict';

angular.module('quiverInvoiceApp')
  .controller('SettingsCtrl', function ($scope, notificationService, stripeService, subscriptionService, environmentService) {
    var env = environmentService.get(),
      setDefaults = function () {
      $scope.newCard = {
        exp_year: $scope.years[0],
        exp_month: 0
      };

      if ($scope.subscriptionForm) {
        $scope.subscriptionForm.$pristine = true;
        $scope.subscriptionForm.$dirty = false;
        $scope.subscriptionForm.number.$pristine = true;
        $scope.subscriptionForm.number.$dirty = false;
        $scope.subscriptionForm.cvc.$pristine = true;
        $scope.subscriptionForm.cvc.$dirty = false;
        $scope.subscriptionForm.month.$pristine = true;
        $scope.subscriptionForm.month.$dirty = false;
      }

    };
    
    
    
    // Set years
    $scope.years = stripeService.getYears();

    // Set months
    $scope.months = stripeService.getMonths();
    
    setDefaults();

    $scope.validateCardNumber = function (number) {
      $scope.subscriptionForm.number.$invalid = !stripeService.validateCardNumber(number);
    };

    $scope.validateCVC = function (cvc) {
      $scope.subscriptionForm.cvc.$invalid = !stripeService.validateCVC(cvc);
    };

    $scope.validateMonth = function (month) {
      $scope.subscriptionForm.month.$invalid = !stripeService.validateMonth(month);
    };

    $scope.createToken = function (card) {
      stripeService.createToken(env.stripe.pk, card).then(function (res) {
        subscriptionService.saveToken(res.response).then(function (token) {
          setDefaults();
          notificationService.success('Subscription', 'Credit Card Added');
        });
      });
    };

    $scope.removeToken = function (subscription) {
      subscriptionService.removeToken().then(function () {
        notificationService.success('Subscription', 'Credit Card Deleted');
      });
    },

    $scope.notify = function (action) {
      return notificationService.promiseNotify('Settings', 'Saved', 'Save failed', action);
    };
  });
