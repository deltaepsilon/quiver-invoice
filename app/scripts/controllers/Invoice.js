'use strict';

angular.module('quiverInvoiceApp')
  .controller('InvoiceCtrl', function ($scope, invoices, invoice, _, $state, $stateParams, notificationService, invoiceService) {
    var indexItems = function () {
      var i = $scope.invoice.items.length;

      while (i--) {
        $scope.invoice.items[i].id = i + 1;
      }
    },
    calculateTotal = function () {
      var i = $scope.invoice.items ? $scope.invoice.items.length : 0,
        total = 0,
        item;

      while (i--) {
        item = $scope.invoice.items[i];
        total += item.rate * item.quantity;
      }

      $scope.invoice.total = total || undefined; // Undefined enables deletion. Otherwise, Firebase refuses to delete.

      if ($scope.invoice.$save) {
        $scope.invoice.$save();
      }
    },
    save = function (invoice) {
      return invoice.$save ? invoice.$save() : calculateTotal();
    },
    unbind;

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
    $scope.create = invoiceService.create;
    $scope.send = invoiceService.send;

    $scope.remove = function (id) {
      if (typeof unbind === 'function') {
        unbind();
      }

      if ($scope.invoice.$off) {
        $scope.invoice.$off('loaded');
        $scope.invoice.$off('change');
      }

      return invoiceService.remove(id);
    };

    $scope.addItem = function (item) {
      var item = _.clone(item);

      if (!$scope.invoice.items) {
        $scope.invoice.items = [];
      }
      $scope.invoice.items.push(item);
      indexItems();
      save($scope.invoice);
    };

    $scope.removeItem = function (item) {
      var i = $scope.invoice.items.length;

      indexItems(); // Just in case the IDs have magically not been assigned yet...

      while (i--) {
        if ($scope.invoice.items[i].id === item.id) {
          $scope.invoice.items.splice(i, 1);
        }
      }

      indexItems();
      save($scope.invoice);
    };

  });
