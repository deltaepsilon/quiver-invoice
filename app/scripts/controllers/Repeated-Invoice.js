'use strict';

angular.module('quiverInvoiceApp')
  .controller('RepeatedInvoiceCtrl', function ($scope) {
    $scope.toggleTagsInput = function (tagsInputShow, tags) {
      $scope.tagsInputShow = !tagsInputShow;
      if (tags && Array.isArray(tags)) {
        $scope.tags = tags.join(", ");
      }

    }
  });
