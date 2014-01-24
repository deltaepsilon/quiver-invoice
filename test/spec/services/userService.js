'use strict';

describe('Service: Userservice', function () {

  // load the service's module
  beforeEach(module('QuiverinvoiceApp'));

  // instantiate service
  var Userservice;
  beforeEach(inject(function (_Userservice_) {
    Userservice = _Userservice_;
  }));

  it('should do something', function () {
    expect(!!Userservice).toBe(true);
  });

});
