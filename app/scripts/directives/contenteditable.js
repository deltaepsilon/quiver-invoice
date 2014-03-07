'use strict';

angular.module('quiverInvoiceApp')
  .directive('contenteditable', function ($timeout) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function postLink(scope, element, attrs, ctrl) {
        var maxLength = parseInt(attrs.ngMaxlength, 10);

        if (window.getSelection) {
          element.on('focus', function() {
            return $timeout(function() {
              var el, range, selection;
              selection = window.getSelection();
              range = document.createRange();
              el = element[0];
              range.setStart(el.firstChild, 0);
              range.setEnd(el.lastChild, el.lastChild.length);
              selection.removeAllRanges();
              return selection.addRange(range);
            });
          });
        }
        element.on('blur', function() {
          return scope.$apply(function() {
            return ctrl.$setViewValue(element.text());
          });
        });
        ctrl.$render = function() {
          return element.text(ctrl.$viewValue);
        };
        ctrl.$render();
        return element.on('keydown', function(e) {
          var del, el, esc, ret, tab;
          esc = e.which === 27;
          ret = e.which === 13;
          del = e.which === 8;
          tab = e.which === 9;
          el = angular.element(e.target);
          if (esc) {
            ctrl.$setViewValue(element.text());
            el.blur();
            return e.preventDefault();
          } else if (ret && attrs.oneLine) {
            return e.preventDefault();
          } else if (maxLength && el.text().length >= maxLength && !del && !tab) {
            return e.preventDefault();
          }
        });
      }
    }
  });
