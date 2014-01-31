'use strict';

angular.module('quiverInvoiceApp')
  .service('userService', function userService($q, $firebase, $firebaseSimpleLogin, environmentService) {
    var env = environmentService.get(),
      firebase = new Firebase(env.firebase),
      firebaseSimpleLogin = $firebaseSimpleLogin(firebase),
      usersRef = $firebase(new Firebase(env.firebase + '/users')),
      Handler = environmentService.Handler;

    return {
      getLoggedInUser: function () {
        var deferred = $q.defer();

        firebaseSimpleLogin.$getCurrentUser().then(deferred.resolve, deferred.reject);

        return deferred.promise;
      },

      get: function () {
        var deferred = $q.defer();

        firebaseSimpleLogin.$getCurrentUser().then(function (user) {
          deferred.resolve(user ? $firebase(new Firebase(env.firebase + '/users/' + user.id)) : null);
        }, deferred.reject);

        return deferred.promise;
      },

      getRef: function () {
        var deferred = $q.defer();

        firebaseSimpleLogin.$getCurrentUser().then(function (user) {
          deferred.resolve(user ? usersRef.$child(user.id) : null);
        }, deferred.reject);

        return deferred.promise;
      },

      getCurrentUser: function () {
        var deferred = $q.defer();

        firebaseSimpleLogin.$getCurrentUser().then(function (user) {
          deferred.resolve(user);
        }, deferred.reject);

        return deferred.promise;
      },

      create: function (user) {
        var deferred = $q.defer();

        firebaseSimpleLogin.$createUser(user.email, user.password).then(function (user) {
          var userRef = $firebase(new Firebase(env.firebase + '/users/' + user.id));
          userRef.email = user.email;
          userRef.$save().then(deferred.resolve, deferred.reject);
        }, deferred.reject);

        return deferred.promise;
      },

      remove: function () {

      },

      reset: function (email) {
        var deferred = $q.defer();

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

        return deferred.promise;

      },

      logIn: function (user) {
        var deferred = $q.defer();

        user.rememberMe = true; // Override default session length (browser session) to be 30 days.
        firebaseSimpleLogin.$login('password', user).then(deferred.resolve, deferred.reject);

        return deferred.promise;
      },

      logOut: function () {
        var deferred = $q.defer();

        deferred.resolve(firebaseSimpleLogin.$logout());

        return deferred.promise;
      }

    }
  });
