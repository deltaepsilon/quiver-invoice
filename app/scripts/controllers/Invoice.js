'use strict';

angular.module('quiverInvoiceApp')
  .controller('InvoiceCtrl', function ($scope, invoices, invoice, _, $state, $stateParams, notificationService, invoiceService, $timeout) {
    var indexItems = function () {
      var i = $scope.invoice.details.items.length;

      while (i--) {
        $scope.invoice.details.items[i].id = i + 1;
      }
    },
    calculateTotal = function () {
      var i = $scope.invoice.details.items ? $scope.invoice.details.items.length : 0,
        total = 0,
        item;

      while (i--) {
        item = $scope.invoice.details.items[i];
        total += item.rate * item.quantity;
      }

      $scope.invoice.details.total = total || undefined; // Undefined enables deletion. Otherwise, Firebase refuses to delete.

      if ($scope.invoice.$save) {
        $scope.invoice.$save();
      }
    },
    save = function (invoice) {
      return invoice.$save ? invoice.$save() : calculateTotal();
    },
    unbind;

//    Settings Stripe publishable key
    $scope.user.$on('loaded', function () {
      if ($scope.user && $scope.user.settings && $scope.user.settings.stripe) {
        $scope.invoice.details.sender.pk = $scope.user.settings.stripe.pk;
      }
    });

//    Setting id... it's very hard to track otherwise. Firebase objects are not aware of their IDs.
    if ($stateParams.id !== 'new') {
      $scope.id = $stateParams.id;
    }


//    Invoices
    $scope.invoices = invoices;
    if ($scope.invoices.$bind) {
      $scope.invoices.$bind($scope, 'invoices');
    }

//    Invoice
    $scope.invoice = invoice;
    if ($scope.invoice.$bind) {
      $scope.invoice.$bind($scope, 'invoice').then(function (res) {
        unbind = res;
      });
      $scope.invoice.$on('loaded', calculateTotal);
      $scope.invoice.$on('change', calculateTotal);
    }


//    Scope functions
    $scope.indexItems = indexItems; // Attaching for testing purposes
    $scope.calculateTotal = calculateTotal;
    $scope.save = save;
    $scope.create = function (invoice, copy) {
      invoiceService.create(invoice, copy);
      $state.go('dashboard');
    };
    $scope.send = function (loggedInUser, invoiceId) {
      invoiceService.send(loggedInUser, invoiceId).then(function () {
        $state.go('dashboard');
      });
    };

    $scope.remove = function (id) {
      if (typeof unbind === 'function') {
        unbind();
      }

      if ($scope.invoice.$off) {
        $scope.invoice.$off('loaded');
        $scope.invoice.$off('change');
      }


      invoiceService.remove(id);
      $state.go('dashboard');

    };

    $scope.addItem = function (item) {
      var item = _.clone(item);

      if (!$scope.invoice.details.items) {
        $scope.invoice.details.items = [];
      }
      $scope.invoice.details.items.push(item);
      indexItems();
      save($scope.invoice);
    };

    $scope.removeItem = function (item) {
      var i = $scope.invoice.details.items.length;

      indexItems(); // Just in case the IDs have magically not been assigned yet...

      while (i--) {
        if ($scope.invoice.details.items[i].id === item.id) {
          $scope.invoice.details.items.splice(i, 1);
        }
      }

      indexItems();
      save($scope.invoice);
    };

  });
