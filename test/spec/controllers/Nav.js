'use strict';

describe('Controller: NavCtrl', function () {

  // load the controller's module
  beforeEach(module('quiverInvoiceApp'));

  var NavCtrl,
    scope,
    generic = function () {
      return arguments;
    },
    genericAsync;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $q) {
    genericAsync = function (name) {
      return function () {
        var deferred = $q.defer();
        deferred.resolve(name);
        return deferred.promise;
      };
    };

    scope = $rootScope.$new();
    NavCtrl = $controller('NavCtrl', {
      $scope: scope,
      user: true,
      loggedInUser: true,
      userService: {
        logOut: genericAsync('logOut'),
        get: genericAsync('get')
      },
      $state: {
        go: generic,
        current: {
          name: 'state name'
        }
      }
    });
  }));

  it('should call userService.logOut on $scope.logOut', inject(function ($timeout) {
    scope.logOut();
    $timeout.flush();
    expect(scope.user).toBe('get');
  }));
});
