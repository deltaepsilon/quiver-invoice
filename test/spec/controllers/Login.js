'use strict';

describe('Controller: LoginCtrl', function () {

  // load the controller's module
  beforeEach(module('quiverInvoiceApp'));

  var LoginCtrl,
    scope,
    q,
    generic = function () {
      var deferred = q.defer();
      deferred.resolve(arguments);
      return deferred.promise;
    };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $q) {
    q = $q;
    scope = $rootScope.$new();
    LoginCtrl = $controller('LoginCtrl', {
      $scope: scope,
      userService: {
        logIn: generic,
        create: generic,
        reset: generic
      },
      notificationService: {
        success: generic,
        error: generic
      },
      $state: {
        go: generic
      }
    });
  }));



  var user = {email: 'test@quiver.is', password: 'user'};

  it('should call userService.logIn', inject(function ($timeout) {
    var result;
    scope.logIn(user).then(function (res) {
      result = res;
    });
    $timeout.flush();
    expect(result[0]).toEqual(user);
  }));

  it('should call userService.create', inject(function ($timeout) {
    var result;
    scope.create(user).then(function (res) {
      result = res;
    });
    $timeout.flush();
    expect(result[0]).toEqual(user);
  }));

  it('should call userService.reset', inject(function ($timeout) {
    var result;
    scope.resetPassword(user).then(function (res) {
      result = res;
    });
    $timeout.flush();
    expect(result[0]).toEqual(user.email);
  }));
});
