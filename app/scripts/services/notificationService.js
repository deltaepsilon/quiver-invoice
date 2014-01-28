'use strict';

angular.module('quiverInvoiceApp')
  .service('notificationService', function notificationService($notification) {
//    $notification.enableHtml5Mode();
    $notification.setSetting('custom', {duration: 4000, enabled: true});

    var service = {
      info: function (title, content, userData) {
        return $notification.notify(null, title, content, userData, 'notify');
      },
      error: function (title, content, userData) {
        return $notification.notify(null, title, content, userData, 'error');
      },
      success: function (title, content, userData) {
        return $notification.notify(null, title, content, userData, 'success');
      },
      warning: function (title, content, userData) {
        return $notification.notify(null, title, content, userData, 'warning');
      },
      promiseNotify: function (title, success, failure, action) {
        var promise = action();

        if (!promise) {
          return console.warn("You've got to return something from the action that you pass in. Dummy.");
        } else {
          promise.then(function (res) {
            service.success(title, success);
          }, function (err) {
            service.error(title, failure);
          });

          return promise;
        }

      }
    };

//    service.info('Notification', 'This is an info message');
//    service.warning('Notification', 'This is an warning message');
//    service.error('Notification', 'This is an error message');
//    service.success('Notification', 'This is an success message');

    return service;
  });
