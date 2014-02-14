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
  .run(function (cacheService, $state, $rootScope, _) {
    cacheService.config(restangularProvider);

    $rootScope.$on('$stateChangeStart', function () {
      $state.previous = _.clone($state);
    });

  })
  .config(function ($stateProvider, $urlRouterProvider, RestangularProvider) {
    restangularProvider = RestangularProvider;

    RestangularProvider.setBaseUrl(window.env.api);
    $urlRouterProvider.otherwise('/');

    var nav = {
      templateUrl: 'views/nav.html',
      controller: 'NavCtrl',
      resolve: {
        user: function (userService) {
          return userService.get();
        },
        loggedInUser: function (userService) {
          return userService.getCurrentUser();
        }
      }
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
      .state('dashboard', {
        url: '/dashboard',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl'
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
      })
      .state('settings', {
        url: '/settings',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/settings.html',
            controller: 'SettingsCtrl',
            resolve: {
              plans: function (subscriptionService) {
                return subscriptionService.getPlans();
              },
              subscription: function (subscriptionService) {
                return subscriptionService.get();
              }
            }
          }
        }
      })
      .state('invoice', {
        url: '/invoice/:id',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/invoice.html',
            controller: 'InvoiceCtrl',
            resolve: {
              invoices: function (invoiceService) {
                return invoiceService.get();
              },
              invoice: function ($stateParams, invoiceService, moment) {
                if ($stateParams.id === 'new') {
                  return invoiceService.newInvoice();
                } else {
                  return invoiceService.get($stateParams.id);
                }

              }
            }
          }
        }
      })
      .state('payment', {
        url: '/payment/:id',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/payment.html',
            controller: 'PaymentCtrl',
            resolve: {
              payment: function ($stateParams, paymentService) {
                return paymentService.get($stateParams.id);

              }
            }
          }
        }
      })
      .state('pay', {
        url: '/users/:userId/invoices/:invoiceId/pay',
        views: {
          nav: nav,
          body: {
            templateUrl: 'views/pay.html',
            controller: 'PayCtrl',
            resolve: {
              invoice: function ($stateParams, invoiceService) {
                return invoiceService.getInvoiceByUser($stateParams.userId, $stateParams.invoiceId);
              }
            }
          }
        }
      });

  });
