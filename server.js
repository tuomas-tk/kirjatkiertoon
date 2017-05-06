require('dotenv').config()
var express = require('express');
var pg = require('pg');
var app = express();
var bodyParser = require('body-parser');

var user     = require('./server/user');
var login    = require('./server/login');
var logout   = require('./server/logout');
var subject  = require('./server/subject');
var book      = require('./server/book');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// API

app.use('/api/login', login);

app.all('/api/*', function(req, res, next) {
  console.log('Auth to API');
  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {

      client.query('SELECT "user" FROM tokens WHERE content = $1 LIMIT 1', [req.body.token], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else {
          if (result.rowCount == 0) { // No tokens found
            res.status(400).json({
              success: false,
              data: 'Invalid credentials'
            })
          } else {
            client.query('SELECT * FROM "users" WHERE id = $1', [result.rows[0].user], function(err2, result2) {  // Get user from db
              done();
              if (err2) {
                console.error(err);
                return res.status(500).json({
                  success: false,
                  data: err2
                });
              } else {
                console.log("Auth success");
                res.locals.user = result2.rows[0]; // Pass user ahead
                next();
              }
            });
          }
        }
      });
    }
  });
});

app.post('/api/test', function(req, res, next) {
  console.log('Test auth');
  return res.status(200).json({
    success: true
  })
});

app.use('/api/user', user);
app.use('/api/logout', logout);
app.use('/api/subject', subject);
app.use('/api/book', book);

app.use(express.static(__dirname + '/dist'));

app.listen(process.env.PORT || 3000, function () {
  console.log('KirjatKiertoon listening on port ' + (process.env.PORT || '3000'))
})
