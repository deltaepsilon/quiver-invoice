var express = require('express'),
  app = express(),
  env = {
    environment: process.env.NODE_ENV,
    firebase: process.env.QUIVER_INVOICE_FIREBASE
  };

app.get('/env', function (req, res) {
  res.json(env);
});

app.listen(9600);