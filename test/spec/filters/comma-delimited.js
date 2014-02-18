'use strict';

describe('Filter: commaDelimited', function () {

  // load the filter's module
  beforeEach(module('quiverInvoiceApp'));

  // initialize a new instance of the filter before each test
  var commaDelimited;
  beforeEach(inject(function ($filter) {
    commaDelimited = $filter('commaDelimited');
  }));

  it('should return the input prefixed with "commaDelimited filter:"', function () {
    var text = 'angularjs';
    expect(commaDelimited(text)).toBe('commaDelimited filter: ' + text);
  });

});
