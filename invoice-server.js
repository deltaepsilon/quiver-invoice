var express = require('express'),
  app = express();

app.get('*', function (req, res) {
  res.json({res: 'Hello World.'});
});

app.listen(9600);