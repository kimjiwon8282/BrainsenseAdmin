var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');

app.get('/', function (req, res) {
  res.send('HELLO WORLD!');
});

app.listen(3000, function () {
  console.log('3030 open');
});
