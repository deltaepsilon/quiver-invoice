'use strict';

var restangularProvider;

angular.module('quiverInvoiceApp', [
  'ngSanitize',
  'restangular',
  'ui.router',
  'angular-google-analytics',
  'jmdobry.angular-cache',
  'firebase',
  'notifications'
])
  .run(function (cacheService) {
    cacheService.config(restangularProvider);
  })
  .config(function ($stateProvider, $urlRouterProvider, RestangularProvider) {
    restangularProvider = RestangularProvider;

    RestangularProvider.setBaseUrl('/');
    $urlRouterProvider.otherwise('/');

    var nav = {
      templateUrl: 'views/nav.html',
      controller: 'NavCtrl'
    };

    $stateProvider
      .state('root', {
        url: '/',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
          }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
          }
        }
      });

  });
