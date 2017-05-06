require('dotenv').config()
var express = require('express');
var pg = require('pg');
var router = express.Router();



router.post('/get/own', function(req, res) {
  console.log('get own subjects');

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('\
SELECT \
  S.*, \
  COALESCE(no, 0)  AS sum_no, \
  COALESCE(yes, 0) AS sum_yes \
FROM subjects AS S \
LEFT JOIN ( \
  SELECT subject, \
  sum(amount) AS no \
  FROM bets \
  WHERE side=0 \
  GROUP BY 1 \
) pn ON pn.subject = S.id \
LEFT JOIN ( \
  SELECT subject, \
  sum(amount) AS yes \
  FROM bets \
  WHERE side=1 \
  GROUP BY 1 \
) py ON py.subject = S.id \
WHERE S."user"=$1 \
ORDER BY S.id DESC;\
      ', [res.locals.user.id], function(err, result) {
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

router.post('/get/:subject', function(req, res) {
  console.log('get single subject');

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query(
        'SELECT S.*, \
        COALESCE((SELECT sum(amount) FROM bets WHERE subject=$1 AND side=0), 0) AS sum_no, \
        COALESCE((SELECT sum(amount) FROM bets WHERE subject=$1 AND side=1), 0) AS sum_yes, \
        U.firstname, U.lastname \
        FROM subjects as S \
        LEFT OUTER JOIN users as U ON (S.user = U.id) \
        WHERE S.id = $1',
        [req.params.subject], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        }

        var resultdata = result.rows[0];
        resultdata.own = (res.locals.user.id == result.rows[0].user);
        res.json({
          success: true,
          data: resultdata
        });

      });
    }

  });
})

router.post('/get/', function(req, res) {
  console.log('get subjects');

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    } else {
      client.query('\
SELECT \
  S.*, \
  COALESCE(no, 0)  AS sum_no, \
  COALESCE(yes, 0) AS sum_yes \
FROM subjects AS S \
LEFT JOIN ( \
  SELECT subject, \
  sum(amount) AS no \
  FROM bets \
  WHERE side=0 \
  GROUP BY 1 \
) pn ON pn.subject = S.id \
LEFT JOIN ( \
  SELECT subject, \
  sum(amount) AS yes \
  FROM bets \
  WHERE side=1 \
  GROUP BY 1 \
) py ON py.subject = S.id \
ORDER BY S.id DESC;\
      ', function(err, result) {

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
  console.log('add subject');

  var data = {
    title: req.body.title,
    description: req.body.description
  };

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      done();
      console.error(err);
      return res.status(500).json({
        success: false, data: err
      });

    } else {

      client.query('INSERT INTO subjects(title, content, "user") values($1, $2, $3)', [data.title, data.description, res.locals.user.id], function(err) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false, data: err
          });
        } else {
          return res.json({
            success: true
          });
        }
      });
    }
  });
});


router.post('/resolve/', function(req, res) {
  console.log('resolve subject');
  var data = {
    subject: req.body.subject,
    side: req.body.side
  };

  if (data.side != 0 && data.side != 1) {
    return res.status(400).json({
      success: false
    });
  }

  pg.connect(process.env.DB_URL, function(err, client, done) {
    if (err) {
      done();
      console.error(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    }


    client.query('              \
WITH ownsubject AS (            \
  SELECT  id                    \
  FROM    subjects              \
  WHERE                         \
    id = $2 AND                 \
    "user" = $1 AND             \
    correct IS NULL             \
)                               \
UPDATE                          \
  users                         \
SET                             \
  money = money + B.win         \
FROM (                          \
  SELECT                        \
    "user",                     \
    sum(amount) AS win          \
  FROM bets, ownsubject         \
  WHERE                         \
    subject = ownsubject.id AND \
    side = $3                   \
  GROUP BY "user"               \
) B                             \
WHERE                           \
  id = B."user";                \
    ', [res.locals.user.id, data.subject, data.side], function(err, result) {
      done();
      if (err) {
        console.error(err);
        return res.status(500).json({
          success:false,
          data: err
        });
      }

      // WARNING: these queries are successful for wrong user too, just returns 0 rows.

      client.query(
        'UPDATE subjects SET correct = $1 WHERE id = $2 AND "user" = $3 AND correct IS NULL;',
        [data.side, data.subject, res.locals.user.id],
        function(err2, result2) {
          if (err2) {
            console.error(err);
            return res.status(500).json({
              success:false,
              data: err
            });
          }

          if (result2.rowCount == 1) {
            return res.json({
              success: true,
              data: {
                rows: result.rowCount
              }
            });

          } else {
            return res.json({
              success: false
            });
          }
      });


    });

  });
});

module.exports = router;
