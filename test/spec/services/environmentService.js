'use strict';

describe('Service: environmentService', function () {

  // load the service's module
  beforeEach(module('quiverInvoiceApp'));

  // instantiate service
  var environmentService;
  beforeEach(inject(function (_environmentService_) {
    environmentService = _environmentService_;
  }));

  it('should do something', function () {
    expect(!!environmentService).toBe(true);
  });

});
