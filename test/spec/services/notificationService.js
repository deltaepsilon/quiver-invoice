'use strict';

describe('Service: notificationService', function () {

  // load the service's module
  beforeEach(module('quiverInvoiceApp'));

  // instantiate service
  var notificationService;
  beforeEach(inject(function (_notificationService_) {
    notificationService = _notificationService_;
  }));

  it('should do something', function () {
    expect(!!notificationService).toBe(true);
  });

});
