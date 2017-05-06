require('dotenv').config()
var express = require('express');
var pg = require('pg');
var router = express.Router();

router.post('/get/profile', function(req, res) {
  res.json({
    success: true,
    data: res.locals.user
  });
})

router.post('/get/dashboard', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query(`
        SELECT
        ( SELECT COUNT(*) FROM books WHERE status=2 AND buyer=$1
        )  as buy_ready,
        ( SELECT COUNT(*) FROM books WHERE status=1 AND buyer=$1
        )  as buy_bought,
        ( SELECT COUNT(*) FROM books WHERE status=1 AND "user"=$1
        )  as sell_sold,
        ( SELECT COUNT(*) FROM books WHERE status=0 AND "user"=$1
        )  as sell_available
        `, [res.locals.user.id], function(err, result) {
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

router.post('/get/school/stats', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query(`
        SELECT
        ( SELECT COUNT(*) FROM books WHERE status=0 )  as status0,
        ( SELECT COUNT(*) FROM books WHERE status=1 )  as status1,
        ( SELECT COUNT(*) FROM books WHERE status=2 )  as status2,
        ( SELECT COUNT(*) FROM books WHERE status=3 )  as status3
        `, [], function(err, result) {
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
