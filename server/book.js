var express = require('express');
var pg = require('pg');
var router = express.Router();

router.post('/get/own', function(req, res) {
  console.log('get own books');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT * FROM books WHERE "user" = $1 ORDER BY id DESC', [res.locals.user.id], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else {
          res.json({
            success: true,
            data: result.rows
          });
        }
      });
    }

  });
});


router.post('/get/', function(req, res) {
  console.log('get all books');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT * FROM books ORDER BY price ASC', [], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else {
          res.json({
            success: true,
            data: result.rows
          });
        }
      });
    }

  });
})

router.post('/add/', function(req, res) {
  console.log('add book');

  var data = {
    subject:   req.body.subject,
    course:    req.body.course,
    name:      req.body.name,
    price:     req.body.price,
    condition: req.body.condition,
    info:      req.body.info
  };

  if (data.condition < 0 || data.condition > 4 || data.course < 0 || data.price < 0 || data.subject == null) {
    return res.status(400).json({
      success: false
    });
  }

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      done();
      console.error(err);
      return res.status(500).json({
        success: false, data: err
      });
    }

    /*client.query(
      'UPDATE users \
      SET money = money - $1 \
      WHERE id = $2 AND money >= $1',
      [data.amount, res.locals.user.id],
      function (err, result) {
        if (err) {
          return res.status(500).json({
            success: false, data: err
          })
        }

        if (result.rowCount != 1) {
          return res.status(400).json({
            success: false, data: 'no enough money'
          })
        }*/

    client.query(
      'INSERT INTO books(subject, course, name, price, condition, info, "user") values($1, $2, $3, $4, $5, $6, $7)',
      [data.subject, data.course, data.name, data.price, data.condition, data.info, res.locals.user.id],
      function(err) {

        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false, data: err
          });
        }

        return res.json({
          success: true
        });
      }
    );

  });
});


module.exports = router;
