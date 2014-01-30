'use strict';

angular.module('quiverInvoiceApp')
  .service('userService', function userService($q, $firebase, $firebaseSimpleLogin, environmentService) {
    var firebase,
      firebaseSimpleLogin,
      usersRef;

    environmentService.get().then(function (env) {
      firebase = new Firebase(env.firebase);
      firebaseSimpleLogin = $firebaseSimpleLogin(firebase);
      usersRef = $firebase(new Firebase(env.firebase + '/users'));
      environmentService.deferred.resolve(env);
    });

    return {
      getLoggedInUser: function () {
        return environmentService.envDependentFunction(function (handler, env) {
          firebaseSimpleLogin.$getCurrentUser().then(handler.resolve, handler.reject);
        });
      },

      get: function () {
        return environmentService.envDependentFunction(function (handler, env) {
          firebaseSimpleLogin.$getCurrentUser().then(function (user) {
            handler.resolve(user ? $firebase(new Firebase(env.firebase + '/users/' + user.id)) : null);
          }, handler.reject);
        });
      },

      getRef: function () {
        return environmentService.envDependentFunction(function (handler) {
          firebaseSimpleLogin.$getCurrentUser().then(function (user) {
            handler.resolve(user ? usersRef.$child(user.id) : null);
          }, handler.reject);
        });
      },

      getCurrentUser: function () {
        return environmentService.envDependentFunction(function (handler, env) {
          firebaseSimpleLogin.$getCurrentUser().then(function (user) {
            handler.resolve(user);
          }, handler.reject);
        });
      },

      create: function (user) {
        return environmentService.envDependentFunction(function (handler, env) {
          firebaseSimpleLogin.$createUser(user.email, user.password).then(function (user) {
            var userRef = $firebase(new Firebase(env.firebase + '/users/' + user.id));
            userRef.email = user.email;
            userRef.$save().then(handler.resolve);
          }, handler.reject);
        });
      },

      remove: function () {

      },

      reset: function (email) {
        var deferred = $q.defer();

        environmentService.envDependentFunction(function (handler, env) {
          // firebaseSimpleLogin.$resetPassword has not yet been implemented in angularfire. We're going it alone.
          var auth = new FirebaseSimpleLogin(firebase, function (err, user) {
            console.log('err, user', err, user);
          });
          auth.sendPasswordResetEmail(email, function (err, success) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(success);
            }
          });
        });

        return deferred.promise;

      },

      logIn: function (user) {
        return environmentService.envDependentFunction(function (handler) {
          user.rememberMe = true; // Override default session length (browser session) to be 30 days.
          firebaseSimpleLogin.$login('password', user).then(handler.resolve, handler.reject);
        });
      },

      logOut: function () {
        return environmentService.envDependentFunction(function (handler) {
          var res = firebaseSimpleLogin.$logout();
          return handler.resolve(res);
        });
      }

    }
  });
