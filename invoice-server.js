require('newrelic');

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
  quiver = require('./middleware/quiver')(env, firebaseSecret),
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

//quiver.userMiddleware attaches and user or invoice specified in the route to the req object.
app.all('/user/*', quiver.userMiddleware);

app.post('/user/:userId/invoice/:invoiceId/send', function (req, res) {
  var user = req.user,
    userRef = req.userRef,
    invoice = req.invoice,
    invoiceRef = req.invoiceRef,
    deferredTemplate = Q.defer(),
    deferredEmail = Q.defer(),
    errorHandler = getErrorHandler(res),
    data = {
      root: env.app + '/#',
      user: user,
      invoice: invoice,
      params: req.params
    },
    template = 'invoice-recipient-email.txt';


  // Render the email template
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
      deferredTemplate.reject(err);
    } else {
      deferredTemplate.resolve(html);
    }

  });



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

  //Save details state and respond
  deferredEmail.promise.then(function (response) {
    invoiceRef.child('details').child('state').set('sent', function (err) {
      if (err) {
        errorHandler(err);
      } else {
        res.json(response);
      }
    });

  }, errorHandler);

});

app.post('/payer/:payerId/user/:userId/invoice/:invoiceId/token', function (req, res) {
  var cardToken = req.body.token,
    payerToken = req.headers.authorization,
    payerId = req.params.payerId,
    userId = req.params.userId,
    invoiceId = req.params.invoiceId,
    payer,
    payerRef,
    user,
    userRef,
    invoice,
    invoiceRef,
    action = function (user, invoice, userRef, invoiceRef, deferredAction) {
      invoiceRef.child('sk').set(user.settings.stripe.sk);
      invoiceRef.child('details').child('token').set(token);
      deferredAction.resolve(token);
    },
    errorHandler = getErrorHandler(res);

  getUser(payerId, payerToken).then(function (result) {
    payer = result.user;
    payerRef = result.userRef;
    return getUser(userId, firebaseSecret);
  }, errorHandler).then(function (result) {
      user = result.user;
      userRef = result.userRef;
      return getInvoice(userId, invoiceId, firebaseSecret);
  }, errorHandler).then(function (result) {
      invoice = result.invoice;
      invoiceRef = result.invoiceRef;

      if (payer.email === invoice.details.recipient.email) {
        invoiceRef.child('sk').set(user.settings.stripe.sk);
        invoiceRef.child('details').child('token').set(cardToken);
        invoiceRef.child('details').child('state').set('card');
        res.json(cardToken);
      } else {
        errorHandler({"error": "Payer email does not match recipient email"});
      }

  }, errorHandler);

});

app.delete('/payer/:payerId/user/:userId/invoice/:invoiceId/token', function (req, res) {
  var payerToken = req.headers.authorization,
    payerId = req.params.payerId,
    userId = req.params.userId,
    invoiceId = req.params.invoiceId,
    payer,
    payerRef,
    user,
    userRef,
    invoice,
    invoiceRef,
    errorHandler = getErrorHandler(res),
    deferredStripe = Q.defer();

  getUser(payerId, payerToken).then(function (result) {
    payer = result.user;
    payerRef = result.userRef;
    return getUser(userId, firebaseSecret);
  }, deferredStripe.reject).then(function (result) {
      user = result.user;
      userRef = result.userRef;
      return getInvoice(userId, invoiceId, firebaseSecret);
  }, deferredStripe.reject).then(function (result) {
      invoice = result.invoice;
      invoiceRef = result.invoiceRef;

      invoiceRef.child('sk').remove();
      invoiceRef.child('details').child('token').remove();
      invoiceRef.child('details').child('state').set('sent');
      deferredStripe.resolve({"message": "Card removed"});
  }, deferredStripe.reject);

  deferredStripe.promise.then(res.json, errorHandler);

});

app.post('/payer/:payerId/user/:userId/invoice/:invoiceId/pay', function (req, res) {
  var deferredStripe = Q.defer(),
    deferredTemplate = Q.defer(),
    deferredEmail = Q.defer(),
    payerToken = req.headers.authorization,
    payerId = req.params.payerId,
    userId = req.params.userId,
    invoiceId = req.params.invoiceId,
    payer,
    payerRef,
    user,
    userRef,
    invoice,
    invoiceRef,
    stripe,
    paymentsRef = new Firebase(env.firebase + '/users/' + payerId + '/payments'),
    errorHandler = getErrorHandler(res);

  getUser(payerId, payerToken).then(function (result) {
    payer = result.user;
    payerRef = result.payerRef;
    return getUser(userId, firebaseSecret);
  }, deferredStripe.reject).then(function (result) {
    user = result.user;
    userRef = result.userRef;
    return getInvoice(userId, invoiceId, firebaseSecret);
  }, deferredStripe.reject).then(function (result) {
      invoice = result.invoice;
      invoiceRef = result.invoiceRef;

      // Make sure that the recipient and the payer are one and the same.
      if (invoice.details.recipient.email === payer.email) {
        stripe = require('stripe')(invoice.sk);

        var payload = {
            amount: invoice.details.total * 100,
            currency: 'usd',
            card: invoice.details.token.id,
            description: 'Invoice #' + invoice.details.number + ', sent to ' + invoice.details.recipient.email
          };

        return stripe.charges.create(payload);
      } else {
        deferredStripe.reject({"error": "Recipient and payer emails do not match."});
      }

  }, deferredStripe.reject).then(function (charge) {
      invoiceRef.child('charge').set(charge, function (err) {
        if (err) {
          deferredStripe.reject(err);
        } else {
          invoiceRef.child('details').child('state').set('paid', function (err) {
            if (err) {
              deferredStripe.reject(err);
            } else {
              deferredStripe.resolve(charge);
            }
          });
        }

      });
  }, deferredStripe.reject);



  deferredStripe.promise.then(function (charge) {
    res.json(charge);
  }, errorHandler);

//  Add to paying user's payments array
  deferredStripe.promise.then(function (charge) {
    paymentsRef.auth(firebaseSecret, function (err, result) {
      // Add to user's payments
      invoice.charge = charge;
      // Strip
      invoice.details.tags = [];
      paymentsRef.push(_.omit(invoice, ['sk']));
    });
  });


//  Send an email out of band
  deferredStripe.promise.then(function (charge) { // Render the email
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
  var user = req.user,
    userRef = req.userRef,
    deferredStripe = Q.defer(),
    errorHandler = getErrorHandler(res);


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
    missing = {"empty": true};

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
  var user = req.user,
    userRef = req.userRef,
    planId = req.params.planId,
    coupon = req.body.coupon,
    deferredStripe = Q.defer(),
    errorHandler = getErrorHandler(res),
    stripe,
    subscription,
    payload;

  if (!user.subscription || !user.subscription.token || !user.subscription.customer) {
    deferredStripe.reject({error: 'Stripe customer missing'});
  } else {

    stripe = require('stripe')(stripeSk);

    payload = {plan: planId};
    if (coupon) { // Add a coupon if appropriate
      payload.coupon = coupon;
    }

    stripe.customers.updateSubscription(user.subscription.customer.id, payload).then(function (response) {
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

  deferredStripe.promise.then(function (subscription) {
    res.json(subscription);
  }, errorHandler);
});

app.delete('/user/:userId/subscription', function (req, res) {
  var deferredStripe = Q.defer(),
    errorHandler = getErrorHandler(res),
    user = req.user,
    userRef = req.userRef,
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

  deferredStripe.promise.then(function (data) {
    res.json(data);
  }, errorHandler)

});

app.listen(9600);
