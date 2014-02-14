var express = require('express'),
  app = express(),
  Q = require('q'),
  Firebase = require('firebase'),
  env,
  firebaseSecret,
  getErrorHandler = function (res) {
    return function (err) {
      res.send(500, err);
    }
  },
  getUser = function (userId, authToken) {
    var userPath = env.firebase + '/users/' + userId,
      userRef = new Firebase(userPath),
      deferredUser = Q.defer()

    // Get user value
    userRef.auth(authToken || firebaseSecret, function (err, result) {
      if (err) {
        deferredUser.reject(err);
      } else {
        userRef.once('value', function (snapshot) {
          deferredUser.resolve({user: snapshot.val(), userRef: userRef});
        });
      }
    });

    return deferredUser.promise;
  },
  getInvoice = function (userId, invoiceId, authToken) {
    var invoiceRef = new Firebase(env.firebase + '/users/' + userId + '/invoices/' + invoiceId),
      deferred = Q.defer();

    invoiceRef.auth(authToken, function (err, result) {

      if (err) {
        deferred.reject(err);
      } else {
        invoiceRef.once('value', function (snapshot) {
          deferred.resolve({invoice: snapshot.val(), invoiceRef: invoiceRef});
        });
      }
    });

    return deferred.promise;
  };


var USER_INVOICE_REGEX = /\/(\d+)\/?(invoice\/)?([^/]+)?/,
  userMiddleware = function (req, res, next) {
    var notAuthorized = function (err) {
        res.send(401, err);
      },
      token = req.headers.authorization,
      match = req.url.match(USER_INVOICE_REGEX),
      userDeferred = Q.defer(),
      invoiceDeferred = Q.defer(),
      userId,
      invoiceId;

    if (req.method === 'OPTIONS') {
      return next();
    }

    if (match && match[1]) {
      userId = match[1];
    }

    if (match && match[2] && match[2] === 'invoice/' && match[3]) {
      invoiceId = match[3];
    }

    if (!token) {
      return notAuthorized({"error": "Missing auth token."});
    }

    if (userId) {
      getUser(userId, token).then(userDeferred.resolve, userDeferred.reject);
    } else {
      return notAuthorized({"error": "Missing userId."});
    }

    if (invoiceId) {
      getInvoice(userId, invoiceId, token).then(invoiceDeferred.resolve, invoiceDeferred.reject);
    } else {
      invoiceDeferred.resolve({});
    }

    Q.all([userDeferred.promise, invoiceDeferred.promise]).spread(function (userResult, invoiceResult) {
      req.user = userResult.user;
      req.userRef = userResult.userRef;
      req.invoice = invoiceResult.invoice;
      req.invoiceRef = invoiceResult.invoiceRef;
      next();
    }, notAuthorized);

  };

module.exports = function (incomingEnv, incomingFirebaseSecret) {
  env = incomingEnv;
  firebaseSecret = incomingFirebaseSecret;

  return {
    getErrorHandler: getErrorHandler,
    getUser: getUser,
    getInvoice: getInvoice,
    userMiddleware: userMiddleware
  };
};

