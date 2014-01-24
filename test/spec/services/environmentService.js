'use strict';

describe('Service: Environmentservice', function () {

  // load the service's module
  beforeEach(module('QuiverinvoiceApp'));

  // instantiate service
  var Environmentservice;
  beforeEach(inject(function (_Environmentservice_) {
    Environmentservice = _Environmentservice_;
  }));

  it('should do something', function () {
    expect(!!Environmentservice).toBe(true);
  });

});
