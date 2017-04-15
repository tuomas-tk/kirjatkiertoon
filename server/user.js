var express = require('express');
var pg = require('pg');
var router = express.Router();

router.post('/get/profile', function(req, res) {
  console.log('get own information');
  res.json({
    success: true,
    data: res.locals.user
  });
})

router.post('/get/money', function(req, res) {
  console.log('get own money');
  res.json({
    success: true,
    data: res.locals.user.money
  });
})

router.post('/get/:user', function(req, res) {
  console.log('get user');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT nick, firstname, lastname FROM users WHERE id = $1 LIMIT 1', [req.params.id], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else if (result.rowCount == 1){
          res.json({
            success: true,
            data: result.rows[0]
          });
        } else {
          res.status(404).json({
            success: false
          });
        }
      });
    }

  });
})

module.exports = router;
