require('dotenv').config()
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
    } else { // CASE status WHEN 1 THEN 0 ELSE 1 END ASC    to move status=1 (waiting for book) to the start of the list
      client.query('SELECT * FROM books WHERE "user" = $1 ORDER BY CASE status WHEN 1 THEN 0 ELSE 1 END ASC, status ASC, id DESC', [res.locals.user.id], function(err, result) {
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

router.post('/get/bought', function(req, res) {
  console.log('get bought books');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else { // CASE status WHEN 2 THEN 0 ELSE 1 END ASC    to move status=2 (get book from school) to the start of the list
      client.query('SELECT * FROM books WHERE "buyer" = $1 ORDER BY CASE status WHEN 2 THEN 0 ELSE 1 END ASC, status ASC, id DESC', [res.locals.user.id], function(err, result) {
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
      client.query('SELECT * FROM books WHERE buyer IS NULL ORDER BY price ASC, id ASC', [], function(err, result) {
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

router.post('/get/:id', function(req, res) {
  console.log('get single book');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT * FROM books WHERE id=$1 AND (status = 0 OR "user" = $2 OR "buyer" = $2 ) LIMIT 1', [req.params.id, res.locals.user.id], function(err, result) {
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
            data: result.rows[0]
          });
        }
      });
    }

  });
})

router.post('/buy/:id', function(req, res) {
  console.log('buy a book');

  if (res.locals.user.type < 0) {
    return res.status(400).json({
      success: false
    });
  }

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    }
    if (res.locals.user.type == 1) {
      client.query(
        'SELECT id FROM users WHERE firstname = $1 AND lastname = $2 AND email = $3 AND type = 2 LIMIT 1',
        [req.body.firstname, req.body.lastname, req.body.email])
        .then(result => {
          var buyer_id
          if (result.rowCount == 0) {
            return client.query(
              `INSERT INTO users(type, firstname, lastname, email, passcode, school) VALUES ($1, $2, $3, $4, $5, $6) returning id`,
              [2, req.body.firstname, req.body.lastname, req.body.email, null, res.locals.user.school])
              .then(result => result.rows[0].id);
          } else {
            return new Promise((resolve, reject) => resolve(result.rows[0].id))
          }
        })
        .then(id => {
          return client.query(
            'UPDATE books SET buyer = $1, status = 1 WHERE id = $2 AND buyer IS NULL AND "user" != $1',
            [id, req.params.id]
          ).then(res => res.rowCount)
        })
        .then(rowCount => {
          if (rowCount == 0) {
            return res.status(400).json({
              success: false
            });
          }
          if (rowCount == 1) {
            return res.status(200).json({
              success: true
            });
          }
        })
        .catch(err => {
          console.log(err)
          return res.status(500).json({
            success: false,
            data: err
          });
        });
    } else {
      client.query('UPDATE books SET buyer=$1, status=1 WHERE id=$2 AND buyer IS NULL AND "user"!=$1', [res.locals.user.id, req.params.id], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else {
          console.log('success')
          if (result.rowCount == 1) {
            return res.json({
              success: true
            });
          } else {
            return res.status(400).json({
              success: false
            });
          }
        }
      });
    }
  });
})

router.post('/add/', function(req, res) {
  console.log('add book');

  var data = {
    course:    req.body.course,
    name:      req.body.name,
    price:     req.body.price,
    condition: req.body.condition,
    info:      req.body.info
  };

  if (data.condition < 0 || data.condition > 5 || data.price < 500 || data.price > 10000 || data.course == "" || data.price == "" || res.locals.user.type < 5) {
    return res.status(400).json({
      success: false,
      data: data
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

    client.query(
      'INSERT INTO books(course, name, price, condition, info, "user", status) values($1, $2, $3, $4, $5, $6, 0) RETURNING id',
      [data.course, data.name, data.price, data.condition, data.info, res.locals.user.id],
      function(err, result) {

        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false, data: err
          });
        }

        return res.json({
          success: true,
          data: {
            id: result.rows[0].id
          }
        });
      }
    );

  });
});


module.exports = router;
