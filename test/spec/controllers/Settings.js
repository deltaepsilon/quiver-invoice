'use strict';

describe('Controller: SettingsCtrl', function () {

  // load the controller's module
  beforeEach(module('quiverInvoiceApp'));

  var SettingsCtrl,
    scope,
    generic =function () {
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
    SettingsCtrl = $controller('SettingsCtrl', {
      $scope: scope,
      notificationService: {
        promiseNotify: function (title, success, failure, action) {
          return action('promiseNotify');
        }
      }
    });

  }));

  it('should be capable of notifying success or error for arbitrary function', function () {
    var value = false,
      testFunction = function () {
        value = true;
        return genericAsync('testFunction')();
      };
    scope.notify(testFunction);
    expect(value).toBe(true);
  });
});
