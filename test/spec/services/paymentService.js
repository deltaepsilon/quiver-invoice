'use strict';

describe('Service: paymentService', function () {

  // load the service's module
  beforeEach(module('quiverInvoiceApp'));

  // instantiate service
  var paymentService;
  beforeEach(inject(function (_paymentService_) {
    paymentService = _paymentService_;
  }));

  it('should do something', function () {
    expect(!!paymentService).toBe(true);
  });

});
