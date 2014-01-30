var express = require('express'),
  app = express(),
  Firebase = require('firebase'),
  firebaseRoot = new Firebase('process.env.QUIVER_INVOICE_FIREBASE'),
  firebaseSecret = process.env.QUIVER_INVOICE_FIREBASE_SECRET,
  env = {
    environment: process.env.NODE_ENV,
    firebase: process.env.QUIVER_INVOICE_FIREBASE
  };

firebaseRoot.auth(firebaseSecret);

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
  var firebaseAuthToken = req.firebaseAuthToken;
  console.log(firebaseAuthToken);
  res.json({firebaseAuthtoken: firebaseAuthToken});
});

app.listen(9600);