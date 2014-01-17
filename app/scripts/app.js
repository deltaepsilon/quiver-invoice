'use strict';

angular.module('quiverInvoiceApp', [
  'ngSanitize',
  'restangular',
  'ui.router',
  'angular-google-analytics',
  'jmdobry.angular-cache',
  'firebase'
])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('root', {
      url: '/',
      views: {
        body: {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        }
      }
    });

  });
