'use strict';

describe('Service: stripeService', function () {

  // load the service's module
  beforeEach(module('quiverInvoiceApp'));

  // instantiate service
  var stripeService;
  beforeEach(inject(function (_stripeService_) {
    stripeService = _stripeService_;
  }));

  it('should do something', function () {
    expect(!!stripeService).toBe(true);
  });

});
