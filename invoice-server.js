var express = require('express'),
  app = express(),
  engines = require('consolidate'),
  Q = require('q'),
  Mandrill = require('mandrill-api/mandrill').Mandrill,
  mandrill = new Mandrill(process.env.MANDRILL_API_KEY),
  Firebase = require('firebase'),
  firebaseRoot = new Firebase('process.env.QUIVER_INVOICE_FIREBASE'),
  firebaseSecret = process.env.QUIVER_INVOICE_FIREBASE_SECRET,
  env = {
    environment: process.env.NODE_ENV,
    firebase: process.env.QUIVER_INVOICE_FIREBASE,
    app: process.env.QUIVER_INVOICE_APP
  };

console.log(Mandrill);

firebaseRoot.auth(firebaseSecret);

app.engine('html', engines.handlebars);
app.engine('txt', engines.handlebars);
app.use(express.bodyParser()); // Hydrates req.body with request body

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']); // Allow whatever they're asking for
  next();
});

app.get('/env', function (req, res) {
  res.json(env);
});

app.post('/user/:userId/invoice/:invoiceId/send', function (req, res) {
  var firebaseAuthToken = req.body.firebaseAuthToken,
    userPath = env.firebase + '/users/' + req.params.userId,
    invoicePath = userPath + '/invoices/' + req.params.invoiceId,
    userRef = new Firebase(userPath),
    invoiceRef = new Firebase(invoicePath),
    deferredInvoice = Q.defer(),
    deferredUser = Q.defer(),
    deferredTemplate = Q.defer(),
    deferredEmail = Q.defer(),
    errorHandler = function (err) {
      res.send(500, err);
    };

  // Get user value
  userRef.auth(firebaseAuthToken, function (err, result) {
    if (err) {
      deferredUser.reject(err);
    } else {
      userRef.once('value', function (snapshot) {
        deferredUser.resolve(snapshot.val())
      });
    }
  });

  // Get invoice value
   deferredUser.promise.then(function () {
     invoiceRef.auth(firebaseAuthToken, function (err, result) {

       if (err) {
         deferredInvoice.reject(err);
       } else {
         invoiceRef.once('value', function (snapshot) {
           deferredInvoice.resolve(snapshot.val())
         });
       }
     });
   });

  // Get email template
  Q.all([deferredUser.promise, deferredInvoice.promise]).spread(function (user, invoice) {
    var data = {
      root: env.app,
      user: user,
      invoice: invoice,
      params: req.params
    };

    res.render('invoice-recipient-email.txt', data, function (err, html) {
      if (err) {
        deferredTemplate.reject(err);
      } else {
        deferredTemplate.resolve(html);
      }

    });
  }, errorHandler);

  // Send email. See https://mandrillapp.com/api/docs/messages.JSON.html
  Q.all([deferredUser.promise, deferredInvoice.promise, deferredTemplate.promise]).spread(function (user, invoice, template) {
    var payload = {
      message: {
        text: template,
        subject: "You Have Received a Quiver Invoice from " + user.email,
        from_email: user.email,
        from_name: user.name,
        to: [
          {
            email: invoice.email,
            name: invoice.name,
            type: 'to'
          }
        ],
        headers: {
          "Reply-To": user.email
        },
        bcc_address: user.email
      }
    };

    mandrill.messages.send(payload, deferredEmail.resolve, deferredEmail.reject);
  }, errorHandler);

  deferredEmail.promise.then(function (response) {
    res.json(response);
  }, errorHandler);



});

app.listen(9600);