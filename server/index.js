require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');

var receipt   = require('./receipt');
var login   = require('./login');
var auth    = require('./auth');
var user    = require('./user');
var logout  = require('./logout');
var book    = require('./book');
var admin   = require('./admin');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV != 'production') {
  app.use((req, res, next) => {
    console.log(req.url)
    next()
  })
}

// API
app.use('/api/login', login);
app.use('/api/receipt', receipt);
app.use('/api/*', auth);

app.post('/api/test', (req, res, next) => {
  res.status(200).json({
    success: true
  })
});

app.use('/api/logout', logout);
app.use('/api/user', user);
app.use('/api/book', book);
app.use('/api/admin', admin);

// Normal app
app.use(express.static(__dirname + '/../dist'));

app.listen(process.env.PORT || 3000, function () {
  console.log('KirjatKiertoon.fi listening on port ' + (process.env.PORT || '3000'))
  console.log('Environment: ' + process.env.NODE_ENV)
})
