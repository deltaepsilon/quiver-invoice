var express = require('express'),
  app = express(),
  engines = require('consolidate'),
  _ = require('underscore'),
  Q = require('q'),
  Mandrill = require('mandrill-api/mandrill').Mandrill,
  mandrill = new Mandrill(process.env.MANDRILL_API_KEY),
  Firebase = require('firebase'),
  firebaseRoot = new Firebase(process.env.QUIVER_INVOICE_FIREBASE),
  firebaseSecret = process.env.QUIVER_INVOICE_FIREBASE_SECRET,
  stripeSk = process.env.QUIVER_INVOICE_STRIPE_SK,
  env = {
    environment: process.env.NODE_ENV,
    firebase: process.env.QUIVER_INVOICE_FIREBASE,
    app: process.env.QUIVER_INVOICE_APP
  },
  quiver = require('./middleware/quiver')(env),
  getErrorHandler = quiver.getErrorHandler,
  getUser = quiver.getUser,
  getInvoice = quiver.getInvoice;

firebaseRoot.auth(firebaseSecret);

app.engine('html', engines.handlebars);
app.engine('txt', engines.handlebars);
app.use(express.bodyParser()); // Hydrates req.body with request body

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']); // Allow whatever they're asking for
  res.header('Cache-Control', 'no-cache');
  next();
});

app.get('/env', function (req, res) {
  res.json(env);
});

app.all('/user/*', quiver.userMiddleware);

// Generic function to get user and invoice then execute an action
var getUserAndInvoice = function (res, auth, userId, invoiceId, action, state) {
  var userPath = env.firebase + '/users/' + userId,
    invoicePath = userPath + '/invoices/' + invoiceId,
    userRef = new Firebase(userPath),
    invoiceRef = new Firebase(invoicePath),
    deferredUser = Q.defer(),
    deferredInvoice = Q.defer(),
    deferredAction = Q.defer(),
    errorHandler = getErrorHandler(res);

  // Get user value
  userRef.auth(auth, function (err, result) {
    if (err) {
      deferredUser.reject(err);
    } else {
      userRef.once('value', function (snapshot) {
        deferredUser.resolve(snapshot.val());
      });
    }
  });

  // Get invoice value
  deferredUser.promise.then(function () {
    invoiceRef.auth(firebaseSecret, function (err, result) {

      if (err) {
        deferredInvoice.reject(err);
      } else {
        invoiceRef.once('value', function (snapshot) {
          deferredInvoice.resolve(snapshot.val());
        });
      }
    });
  });

  Q.all([deferredUser.promise, deferredInvoice.promise]).spread(function (user, invoice) {
    action(user, invoice, userRef, invoiceRef, deferredAction);

    deferredAction.promise.then(function () {
      invoiceRef.child('details').child('state').set(state);
    });
  }, errorHandler);

  return deferredAction.promise;
};

app.post('/user/:userId/invoice/:invoiceId/send', function (req, res) {
  var user,
    invoice,
    firebaseAuthToken = req.body.firebaseAuthToken,
    deferredTemplate = Q.defer(),
    deferredEmail = Q.defer(),
    errorHandler = getErrorHandler(res),
    action = function (aUser, aInvoice, userRef, invoiceRef, deferredAction) {
      user = aUser;
      invoice = aInvoice;

      var data = {
          root: env.app + '/#',
          user: user,
          invoice: invoice,
          params: req.params
        },
        template = 'invoice-recipient-email.txt';

      switch (invoice.state) {
        case 'sent':
          template = 'invoice-recipient-email-reminder.txt';
          break;
        case 'paid':
          return deferredTemplate.reject({error: 'Invoice has already been sent!'});
          break;
        default:
          template = 'invoice-recipient-email.txt';
          break;
      }

      res.render(template, data, function (err, html) {
        if (err) {
          deferredAction.reject(err);
        } else {
          deferredAction.resolve(html);
        }

      });
    };

  getUserAndInvoice(res, firebaseAuthToken, req.params.userId, req.params.invoiceId, action, 'sent').then(deferredTemplate.resolve);


  // Send email. See https://mandrillapp.com/api/docs/messages.JSON.html
  deferredTemplate.promise.then(function (template) {
    var payload = {
      message: {
        text: template,
        subject: "You Have Received a Quiver Invoice from " + invoice.details.sender.name,
        from_email: invoice.details.sender.email,
        from_name: invoice.details.sender.name,
        to: [
          {
            email: invoice.details.recipient.email,
            name: invoice.details.recipient.name,
            type: 'to'
          }
        ],
        headers: {
          "Reply-To": invoice.details.sender.email
        },
        bcc_address: user.email
      }
    };

    if (invoice.details.state === 'sent') {
      payload.message.subject = "Quiver Invoice Reminder from " + invoice.details.sender.name;
    }

    mandrill.messages.send(payload, deferredEmail.resolve, deferredEmail.reject);
  }, errorHandler);

  deferredEmail.promise.then(function (response) {
    res.json(response);
  }, errorHandler);



});

app.post('/user/:userId/invoice/:invoiceId/token', function (req, res) {
  var token = req.body.token,
    action = function (user, invoice, userRef, invoiceRef, deferredAction) {
      invoiceRef.child('sk').set(user.settings.stripe.sk);
      invoiceRef.child('details').child('token').set(token);
      deferredAction.resolve(token);
    },
    errorHandler = getErrorHandler(res);

  getUserAndInvoice(res, firebaseSecret, req.params.userId, req.params.invoiceId, action, 'credit card').then(function (result) {
    res.json(result);
  }, errorHandler);

});

app.delete('/user/:userId/invoice/:invoiceId/token', function (req, res) {
  var action = function (user, invoice, userRef, invoiceRef, deferredAction) {
      invoiceRef.child('sk').remove();
      invoiceRef.child('details').child('token').remove();
      deferredAction.resolve({});
    };

  getUserAndInvoice(res, firebaseSecret, req.params.userId, req.params.invoiceId, action, 'sent').then(function (result) {
    res.json(result);
  });

});

app.post('/user/:userId/invoice/:invoiceId/pay', function (req, res) {
  var deferredPayment = Q.defer(),
    deferredTemplate = Q.defer(),
    deferredEmail = Q.defer(),
    user,
    invoice,
    payerId = req.body.id,
    payerAuthToken = req.body.firebaseAuthToken,
    paymentsRef = new Firebase(env.firebase + '/users/' + payerId + '/payments'),
    action = function (aUser, aInvoice, userRef, invoiceRef, deferredAction) {
      user = aUser;
      invoice = aInvoice;

      // Check that the user can auth with her own endpoint before proceeding
//      paymentsRef.auth(payerAuthToken, function (err, result) {
//        if (err) {
//          deferredAction.reject(err);
//        } else {
//          deferredPayment.resolve(result);
//        }
//      });

      deferredPayment.resolve({});

      // Execute Stripe charge and resolve deferredAction
      deferredPayment.promise.then(function () {
        var stripe = require('stripe')(invoice.sk),
          payload = {
            amount: invoice.details.total * 100,
            currency: 'usd',
            card: invoice.details.token.id,
            description: 'Invoice #' + invoice.details.number + ', sent to ' + invoice.details.recipient.email
          };

        stripe.charges.create(payload).then(function (charge) {
          invoiceRef.child('charge').set(charge);
          deferredAction.resolve(charge);
        }, deferredAction.reject);
      });

    },
    errorHandler = getErrorHandler(res),
    getUserAndInvoicePromise;

  getUserAndInvoicePromise = getUserAndInvoice(res, firebaseSecret, req.params.userId, req.params.invoiceId, action, 'paid');

//  Respond to request
  getUserAndInvoicePromise.then(function (result) {
    res.json(result);

  }, errorHandler);

//  Add to paying user's payments array
  getUserAndInvoicePromise.then(function (charge) {
    paymentsRef.auth(firebaseSecret, function (err, result) {
      // Add to user's payments
      invoice.charge = charge;
      paymentsRef.push(_.omit(invoice, ['sk']));
    });
  });


//  Send an email out of band
  getUserAndInvoicePromise.then(function (charge) { // Render the email
    var data = {
        root: env.app + '/#',
        user: user,
        invoice: invoice,
        params: req.params,
        total: charge.amount / 100
      },
      template = 'invoice-recipient-paid.txt';

    res.render(template, data, function (err, html) {
      if (err) {
        deferredTemplate.reject(err);
      } else {
        deferredTemplate.resolve(html);
      }

    });

  });

  deferredTemplate.promise.then(function (template) { // Send the email
    var payload = {
      message: {
        text: template,
        subject: "You Have Paid a Quiver Invoice from " + invoice.details.sender.name,
        from_email: invoice.details.sender.email,
        from_name: invoice.details.sender.name,
        to: [
          {
            email: invoice.details.recipient.email,
            name: invoice.details.recipient.name,
            type: 'to'
          }
        ],
        headers: {
          "Reply-To": invoice.details.sender.email
        },
        bcc_address: user.email
      }
    };

    mandrill.messages.send(payload, deferredEmail.resolve, deferredEmail.reject);

  });

});

// Customer Methods
app.post('/user/:userId/customer', function (req, res) {
  var userId = req.params.userId,
    deferredStripe = Q.defer(),
    errorHandler = getErrorHandler(res);


  // Create Stripe customer
  getUser(userId).then(function (result) {
    var user = result.user,
      userRef = result.userRef;

    if (!user.subscription || !user.subscription.token) {
      deferredStripe.reject({error: 'Stripe token missing'});
    } else {

      var stripe = require('stripe')(stripeSk),
        payload = {
          description: 'Quiver Invoice Customer: ' + user.email,
          card: user.subscription.token.id
        },
        callback = function (customer) {
          userRef.child('subscription').child('customer').set(customer);
          deferredStripe.resolve(customer);
        };

      if (user.subscription.customer) {
        stripe.customers.update(user.subscription.customer.id, payload).then(callback, deferredStripe.reject);
      } else {
        stripe.customers.create(payload).then(callback, deferredStripe.reject);
      }

    }

  }, errorHandler);

  deferredStripe.promise.then(function (customer) {
    res.json(customer);
  }, errorHandler);
});

// Plan Methods
app.get('/plan', function (req, res) {
  var stripe = require('stripe')(stripeSk);

  stripe.plans.list(function (err, plans) {
    if (err) {
      res.send(500, err);
    } else {
      res.json(plans.data);
    }
  });
});

app.get('/user/:userId/subscription', function (req, res) {
  var deferredStripe = Q.defer(),
    stripe = require('stripe')(stripeSk),
    user = req.user,
    userRef = req.userRef,
    missing = {"empty": "No subscriptions"};

    if (!user.subscription || !user.subscription.customer) {
      deferredStripe.resolve(missing);
    } else {
      stripe.customers.retrieve(user.subscription.customer.id, function (err, customer) {
        if (err || !customer) {
          deferredStripe.resolve(missing);
        } else {
          userRef.child('subscription').child('customer').set(customer, function () {
            deferredStripe.resolve(customer.subscription || missing);
          });
        }
      });

    }


  deferredStripe.promise.then(function (data) {
    res.json(data);
  }, function (err) {
    res.send(500, err);
  });

});

app.post('/user/:userId/plan/:planId', function (req, res) {
  var userId = req.params.userId,
    planId = req.params.planId,
    deferredStripe = Q.defer(),
    errorHandler = getErrorHandler(res);


  // Get Stripe customer
  getUser(userId).then(function (result) {
    var user = result.user,
      userRef = result.userRef,
      stripe,
      subscription;

    if (!user.subscription || !user.subscription.token || !user.subscription.customer) {
      deferredStripe.reject({error: 'Stripe customer missing'});
    } else {

      stripe = require('stripe')(stripeSk);

      stripe.customers.updateSubscription(user.subscription.customer.id, {plan: planId}).then(function (response) {
        subscription = response;
        return stripe.customers.retrieve(user.subscription.customer.id);
      }).then(function (customer) {
          // Save these suckers out of band... they might fail, but that won't derail the Stripe action
          userRef.child('subscription').child('details').set(subscription, function () {
            userRef.child('subscription').child('customer').set(customer, function () {
              deferredStripe.resolve(subscription);
            });
          });

        }, deferredStripe.reject);
    }

  }, errorHandler);

  deferredStripe.promise.then(function (subscription) {
    res.json(subscription);
  }, errorHandler);
});

app.delete('/user/:userId/subscription', function (req, res) {
  var userId = req.params.userId,
    deferredStripe = Q.defer(),
    errorHandler = getErrorHandler(res);

  getUser(userId).then(function (result) {
    var user = result.user,
      userRef = result.userRef,
      stripe,
      subscription;

    if (!user.subscription || !user.subscription.customer) {
      deferredStripe.reject({error: 'Stripe customer missing'});
    } else {
      stripe = require('stripe')(stripeSk);

      stripe.customers.cancelSubscription(user.subscription.customer.id, user.subscription.customer.subscription.id, {at_period_end: true}).then(function (response) {
        subscription = response;
        return stripe.customers.retrieve(user.subscription.customer.id);
      }).then(function (customer) {
          return userRef.child('subscription').child('customer').set(customer);
      }).then(function (response) {
          userRef.child('subscription').child('details').set(subscription);
      }).then(deferredStripe.resolve, deferredStripe.reject);


    }

  });

  deferredStripe.promise.then(function (data) {
    res.json(data);
  }, errorHandler)

});

app.listen(9600);