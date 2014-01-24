'use strict';

describe('Service: cacheService', function () {

  var generic = function () {
    return arguments;
  };

  // load the service's module
  beforeEach(module('quiverInvoiceApp', function ($provide) {
    $provide.value('$angularCacheFactory', function () {
      return {
        setOptions: generic
      };
    });
  }));


  // instantiate service
  var cacheService;
  beforeEach(inject(function (_cacheService_) {
    cacheService = _cacheService_;
  }));

  it('should allow config', function () {
    var provider = {
      setDefaultHttpFields: generic
    };
    expect(cacheService.config(provider)).toEqual({0: { cache: { setOptions: generic } } });
  });

  it('should provide a get function', function () {
    expect(cacheService.get()).toEqual({ setOptions: generic });
  });

});
