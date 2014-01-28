'use strict';

describe('Service: userService', function () {

  var provide,
    generic = function () {
      return arguments;
    },
    genericAsync;

  // load the service's module
  beforeEach(module('quiverInvoiceApp', function ($provide) {
    provide = $provide
  }));

  beforeEach(inject(function ($q) {
    genericAsync = function (name) {
      return function () {
        var deferred = $q.defer();
        deferred.resolve(name);
        return deferred.promise;
      };
    };

    provide.value('Restangular', {
      one: function (arg) {
        return {
          get: function () {
            var deferred = $q.defer();
            deferred.resolve({firebase: "https://quiver.firebaseIO.com"});
            return deferred.promise;
          }
        };
      }
    });

    provide.value('$firebase', function () {
      return {
        $child: function () {
          return '$child'
        },
        $save: genericAsync('$save')
      };
    });

    provide.value('$firebaseSimpleLogin', function (ref) {
      return {
        $getCurrentUser: genericAsync('$getCurrentUser'),
        $createUser: genericAsync('$createUser'),
        $login: genericAsync('$login'),
        $logout: genericAsync('$logout')
      };
    });
  }));

  // instantiate service
  var userService;
  beforeEach(inject(function (_userService_) {
    userService = _userService_;
  }));

  it('should call $getCurrentUser for get', inject(function ($timeout) {
    var result;
    userService.get().then(function (res) {
      result = Object.keys(res);
    });
    $timeout.flush();
    expect(result).toEqual(['$child', '$save']);
  }));



  var user = {email: 'test@quiver.is', password: 'user'};

  it('should call $createUser for create', inject(function ($timeout) {
    var result;
    userService.create(user).then(function (res) {
      result = res;
    });
    $timeout.flush();
    expect(result).toEqual('$save');
  }));

  it('should call $login for logIn', inject(function ($timeout) {
    var result;
    userService.logIn(user).then(function (res) {
      result = res;
    });
    $timeout.flush();
    expect(result).toBe('$login');
  }));

  it('should call $logout for logOut', inject(function ($timeout) {
    var result;
    userService.logOut(user).then(function (res) {
      result = res;
    });
    $timeout.flush();
    expect(result).toBe('$logout');
  }));

});
