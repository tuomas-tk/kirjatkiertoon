require('dotenv').config()
var express = require('express');
var pg = require('pg');
var router = express.Router();
var crypto = require('crypto');

router.post('/', function(req, res) {
  console.log('login (code)');

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT id, type, firstname, lastname FROM users WHERE passcode = $1 LIMIT 1', [req.body.passcode], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else {

          if (result.rowCount == 0) {
            res.status(400).json({
              success: false,
              data: 'Invalid credentials'
            })
          } else {
            var token = crypto.randomBytes(64).toString('hex');

            client.query('INSERT INTO tokens("user", "content") values($1, $2)', [result.rows[0].id, token], function(err2, result2) {
              done();
              if (err2) {
                console.error(err);
                return res.status(500).json({
                  success: false,
                  data: err2
                });
              } else {
                res.json({
                  success: true,
                  data: {
                    token: token,
                    user: result.rows[0]
                  }
                });
              }
            });
          }
        }
      });
    }

  });
})

router.post('/app/new', function(req, res) {
  console.log('new user (app)');
  var data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    type: req.body.type
  };

  if (data.type == null || data.firstname == null) {
    return res.status(400).json({
      success: false
    });
  }

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT COUNT(*) FROM users WHERE email = $1', [data.email], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else {
          if (result.rows[0].count != 0) {
            res.status(409).json({
              success: false,
              data: 'Email already in use'
            });
          } else {
            //var identifier = crypto.randomBytes(128).toString('hex');
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

            var passcode = "NRSL ";
            for( var i=0; i < 4; i++ ) {
              passcode += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            client.query('INSERT INTO users(type, firstname, lastname, email, passcode, school) values($1, $2, $3, $4, $5, $6)', [data.type, data.firstname, data.lastname, data.email, passcode, 1], function(err2, result2) {
              done();
              if (err2) {
                console.error(err2);
                return res.status(500).json({
                  success: false,
                  data: err2
                });
              } else {
                res.json({
                  success: true,
                  data: {
                    identifier: identifier
                  }
                });
              }
            });
          }
        }
      });
    }

  });
})



module.exports = router;
