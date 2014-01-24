'use strict';

describe('Service: notificationService', function () {

  var generic = function () {
    return arguments;
  };

  // load the service's module
  beforeEach(module('quiverInvoiceApp', function ($provide) {
    $provide.value('$notification', {
      enableHtml5Mode: generic,
      setSetting: generic,
      notify: generic
    });
  }));

  // instantiate service
  var notificationService;
  beforeEach(inject(function (_notificationService_) {
    notificationService = _notificationService_;
  }));

  it('should supply methods for info', function () {
    var expected = [null, 'test', undefined, undefined, 'notify'];
    expect(notificationService.info('test')).toEqual(expected);
  });

  it('should supply methods for error', function () {
    var expected = [null, 'test', undefined, undefined, 'error'];
    expect(notificationService.error('test')).toEqual(expected);
  });

  it('should supply methods for success', function () {
    var expected = [null, 'test', undefined, undefined, 'success'];
    expect(notificationService.success('test')).toEqual(expected);
  });

  it('should supply methods for warning', function () {
    var expected = [null, 'test', undefined, undefined, 'warning'];
    expect(notificationService.warning('test')).toEqual(expected);
  });

});
