require('dotenv').config()
var express = require('express');
var pg = require('pg');
var router = express.Router();

router.post('/get/books', function(req, res) {
  console.log('admin get books')
  if (res.locals.user.type < 10) {
    return res.status(403).json({
      success: false,
      data: 'Forbidden'
    })
  }
  /*book: {
    course: this.course,
    name: this.name,
    code: this.code,
    status: this.status
  },
  person: {
    firstname: this.firstname,
    lastname: this.lastname,
    email: this.email,
    passcode: this.passcode
  }*/
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else { // CASE status WHEN 1 THEN 0 ELSE 1 END ASC    to move status=1 (waiting for book) to the start of the list
      client.query('\
SELECT \
 books.*, \
 sell_user.firstname::text || \' \' || sell_user.lastname as seller, \
 buy_user.firstname  || \' \' || buy_user.lastname  as buyer   \
FROM books                                      \
LEFT JOIN users as sell_user                    \
 ON sell_user.id = books."user"                 \
LEFT JOIN users as buy_user                     \
 ON buy_user.id = books.buyer                   \
WHERE                                           \
 COALESCE(course,\'\')        ILIKE $1 AND                     \
 COALESCE(name,\'\')          ILIKE $2 AND                     \
 COALESCE(code,\'\')          ILIKE $3 AND                     \
 COALESCE(status::text,\'\')  ILIKE $4 AND                     \
 (                                              \
  (COALESCE(sell_user.firstname,\'\') ILIKE $5 AND COALESCE(sell_user.lastname,\'\') ILIKE $6 AND COALESCE(sell_user.email,\'\') ILIKE $7 AND COALESCE(sell_user.passcode,\'\') ILIKE $8) OR \
  (COALESCE( buy_user.firstname,\'\') ILIKE $5 AND COALESCE( buy_user.lastname,\'\') ILIKE $6 AND COALESCE( buy_user.email,\'\') ILIKE $7 AND COALESCE( buy_user.passcode,\'\') ILIKE $8)    \
 )                                              \
ORDER BY id DESC                                \
      ', [
        (req.body.book.course || '%'),
        '%'+(req.body.book.name || '')+'%',
        '%'+(req.body.book.code || '')+'%',
        '%'+(req.body.book.status || '')+'%',
        '%'+(req.body.person.firstname || '')+'%',
        '%'+(req.body.person.lastname || '')+'%',
        '%'+(req.body.person.email || '')+'%',
        '%'+(req.body.person.passcode || '')+'%'
      ], function(err, result) {
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

router.post('/get/users', function(req, res) {
  console.log('admin get users')
  if (res.locals.user.type < 10) {
    return res.status(403).json({
      success: false,
      data: 'Forbidden'
    })
  }
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('\
SELECT * FROM users WHERE \
type < 100             AND \
firstname LIKE $1     AND \
lastname  LIKE $2         \
ORDER BY lastname ASC \
      ', ['%'+(req.body.firstname || '')+'%', '%'+(req.body.lastname || '')+'%'], function(err, result) {
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

router.post('/add/user', function(req, res) {
  console.log('add user');
  var data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    type: req.body.type
  };

  if (data.type == null || data.type == '' || data.firstname == null || data.firstname == '') {
    return res.status(400).json({
      success: false
    });
  }

  if (res.locals.user.type < 10 || res.locals.user.type < data.type) {
    return res.status(403).json({
      success: false,
      data: 'Forbidden'
    })
  }

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT COUNT(*) FROM users WHERE email = $1 AND $1 <> \'\'', [data.email], function(err, result) {
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
            var possible = "abcdefghijklmnopqrstuvwxyz1234567890"; // 36 characters

            var passcode = '';
            for( var i=0; i < 8; i++ ) {
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
                    firstname: data.firstname,
                    lastname: data.lastname,
                    email: data.email,
                    type: data.type,
                    passcode: passcode
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
