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

router.post('/edit/profile', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('SELECT * FROM users WHERE id=$1', [res.locals.user.id], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        }
        if (result.rowCount !== 1) {
          return res.status(400).json({
            success: false
          });
        }
        var original = result.rows[0]
        if (req.body.firstname != null) {
          original.firstname = req.body.firstname
        }
        if (req.body.lastname != null) {
          original.lastname = req.body.lastname
        }
        if (req.body.email != null) {
          original.email = req.body.email
        }
        client.query(
          'UPDATE users SET firstname=$1, lastname=$2, email=$3 WHERE id=$4',
          [original.firstname, original.lastname, original.email, res.locals.user.id],
          function(err, result) {
            done();
            if (err) {
              console.error(err);
              return res.status(500).json({
                success: false,
                data: err
              });
            }
            if (result.rowCount !== 1) {
              return res.status(400).json({
                success: false
              });
            }
            return res.json({
              success: true
            });
          }
        );
      });
    }
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
      var query;
      var params = []
      if (res.locals.user.type == 1) {
        query = `SELECT COUNT(*) as available FROM books WHERE status = 0`
      } else if (res.locals.user.type >= 2 && res.locals.user.type < 10) {
        query = `SELECT
          ( SELECT COUNT(*) FROM books WHERE status=2 AND buyer=$1
          )  as buy_ready,
          ( SELECT COUNT(*) FROM books WHERE status=1 AND buyer=$1
          )  as buy_bought,
          ( SELECT COUNT(*) FROM books WHERE status=1 AND "user"=$1
          )  as sell_sold,
          ( SELECT COUNT(*) FROM books WHERE status=0 AND "user"=$1
          )  as sell_available`
        params = [res.locals.user.id]
      } else if (res.locals.user.type >= 10) {
        query = `SELECT
          ( SELECT COUNT(*) FROM books WHERE status=0 )  as status0,
          ( SELECT COUNT(*) FROM books WHERE status=1 )  as status1,
          ( SELECT COUNT(*) FROM books WHERE status=2 )  as status2,
          ( SELECT COUNT(*) FROM books WHERE status=3 )  as status3`
      } else {
        return res.status(500).json({
          success: false,
          data: res.locals.user
        });
      }

      client.query(query, params, function(err, result) {
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

/*router.post('/get/school/stats', function(req, res) {
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
})*/

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
