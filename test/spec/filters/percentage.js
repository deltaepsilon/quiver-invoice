'use strict';

describe('Filter: percentage', function () {

  // load the filter's module
  beforeEach(module('quiverInvoiceApp'));

  // initialize a new instance of the filter before each test
  var percentage;
  beforeEach(inject(function ($filter) {
    percentage = $filter('percentage');
  }));

  it('should return the input prefixed with "percentage filter:"', function () {
    var text = 'angularjs';
    expect(percentage(text)).toBe('percentage filter: ' + text);
  });

});
