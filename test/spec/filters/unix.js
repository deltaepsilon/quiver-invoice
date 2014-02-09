'use strict';

describe('Filter: unix', function () {

  // load the filter's module
  beforeEach(module('quiverInvoiceApp'));

  // initialize a new instance of the filter before each test
  var unix;
  beforeEach(inject(function ($filter) {
    unix = $filter('unix');
  }));

  it('should return the input prefixed with "unix filter:"', function () {
    expect(unix(1318781876)).toBe('2011-10-16T10:17:56-06:00');
  });

});
