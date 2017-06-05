require('dotenv').config()
var express = require('express');
var pg = require('pg');
var router = express.Router();
var crypto = require('crypto');

router.post('/', function(req, res) {
  console.log('login (code)');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT id, type, firstname, lastname, email FROM users WHERE passcode = $1 LIMIT 1', [req.body.passcode], function(err, result) {
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

module.exports = router;
