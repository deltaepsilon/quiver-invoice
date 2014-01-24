'use strict';

describe('Service: Notificationservice', function () {

  // load the service's module
  beforeEach(module('QuiverinvoiceApp'));

  // instantiate service
  var Notificationservice;
  beforeEach(inject(function (_Notificationservice_) {
    Notificationservice = _Notificationservice_;
  }));

  it('should do something', function () {
    expect(!!Notificationservice).toBe(true);
  });

});
