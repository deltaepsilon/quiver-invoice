'use strict';

describe('Controller: InvoiceCtrl', function () {

  // load the controller's module
  beforeEach(module('quiverInvoiceApp'));

  var InvoiceCtrl,
    scope,
    generic = function () {
      return arguments;
    };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();

    scope.user = {
      '$on': generic
    };

    InvoiceCtrl = $controller('InvoiceCtrl', {
      $scope: scope,
      invoice: {
        details: {
          items: [
            {
              name: 'first',
              rate: 1,
              quantity: 11
            },
            {
              name: 'second',
              rate: 5,
              quantity: 5
            }
          ]
        }
      },
      invoices: {}
    });
  }));

  it('should correctly splice items', function () {
    scope.indexItems();
    expect(scope.invoice.details.items[0].id).toBe(1);
    expect(scope.invoice.details.items[1].id).toBe(2);
  });

  it('should correctly calculate totals', function () {
    scope.calculateTotal();
    expect(scope.invoice.details.total).toBe(36);
  });

  it('should add items', function () {
    var item = {
      name: 'new',
      rate: 1,
      quantity: 1
    };
    scope.addItem(item);
    expect(scope.invoice.details.items.length).toBe(3);
    expect(scope.invoice.details.total).toBe(37);

  });

  it('should remove items', function () {
    scope.removeItem(scope.invoice.details.items[0]);
    expect(scope.invoice.details.items.length).toEqual(1);
    expect(scope.invoice.details.items[0].id).toBe(1);
    expect(scope.invoice.details.items[0].name).toBe('second');
  });

});
