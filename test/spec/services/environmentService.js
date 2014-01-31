'use strict';

describe('Service: environmentService', function () {

  // load the service's module
  beforeEach(module('quiverInvoiceApp', function ($provide) {
    $provide.value('Restangular', {
        one: function (arg) {
          return {
            get: function () {
              return arg
            }
          };
        }
    });
  }));

  // instantiate service
  var environmentService;
  beforeEach(inject(function (_environmentService_, $window) {
    environmentService = _environmentService_;
  }));

  it('should GET env.json', function () {
//    expect(environmentService).toEqual({});
    expect(Object.keys(environmentService.get())).toEqual(['environment', 'firebase', 'api']);
  });

});
