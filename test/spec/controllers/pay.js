'use strict';

describe('Controller: PayCtrl', function () {

  // load the controller's module
  beforeEach(module('quiverInvoiceApp'));

  var PayCtrl,
    scope,
    generic = function () {
      return arguments;
    },
    genericAsync,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $q, $httpBackend) {
    httpBackend = $httpBackend;

    genericAsync = function (name) {
      return function () {
        var deferred = $q.defer();
        deferred.resolve(name);
        return deferred.promise;
      };
    };

    scope = $rootScope.$new();
    PayCtrl = $controller('PayCtrl', {
      $scope: scope,
      invoice: {

      },
      stripeService: {
        clearCache: generic,
        createToken: genericAsync('createToken'),
        saveToken: genericAsync('saveToken'),
        removeToken: genericAsync('removeToken')
      }
    });
  }));



  it('should set years', function () {
    expect(scope.years).toEqual([ 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023 ]);
  });

  it('should set months', function () {
    expect(scope.months).toEqual([ 'Expiration Month', 'January (1)', 'February (2)', 'March (3)', 'April (4)', 'May (5)', 'June (6)', 'July (7)', 'August (8)', 'September (9)', 'October (10)', 'November (11)', 'December (12)' ]);
  });

});
