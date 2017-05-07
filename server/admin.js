require('dotenv').config()
var express = require('express');
var pg = require('pg');
var router = express.Router();

router.post('/get/books', function(req, res) {
  console.log('admin get books')
  if (res.locals.user.type < 10 && res.locals.user.type >= 20) {
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
SELECT * FROM books WHERE   \
course        LIKE $1 AND \
name          LIKE $2 AND \
status::text  LIKE $3     \
ORDER BY id DESC \
      ', [req.body.book.course, req.body.book.name, req.body.book.status], function(err, result) {
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


module.exports = router;
