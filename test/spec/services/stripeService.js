'use strict';

describe('Service: Stripeserivce', function () {

  // load the service's module
  beforeEach(module('quiverInvoiceApp'));

  // instantiate service
  var Stripeserivce;
  beforeEach(inject(function (_Stripeserivce_) {
    Stripeserivce = _Stripeserivce_;
  }));

  it('should do something', function () {
    expect(!!Stripeserivce).toBe(true);
  });

});
