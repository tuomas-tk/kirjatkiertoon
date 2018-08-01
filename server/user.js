require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()

module.exports = router

router.post('/get/profile', (req, res) => {
  res.json({
    success: true,
    data: res.locals.user
  });
})
// TODO add school
router.post('/get/dashboard', async (req, res) => {
  const userType = res.locals.user.type
  var result
  if (userType === 1) {
    result = await db.query(`
      SELECT COUNT(books.id) as available
      FROM books
      LEFT JOIN users
        ON books."user" = users.id
      WHERE
        books.status = 0 AND
        users.school = $1`,
      [res.locals.user.school]
    )
  } else if (userType >= 2 && userType < 10) {
    result = await db.query(
      `SELECT
      ( SELECT COUNT(*) FROM books WHERE status=2 AND buyer=$1
      )  as buy_ready,
      ( SELECT COUNT(*) FROM books WHERE status=1 AND buyer=$1
      )  as buy_bought,
      ( SELECT COUNT(*) FROM books WHERE status=1 AND "user"=$1
      )  as sell_sold,
      ( SELECT COUNT(*) FROM books WHERE status=0 AND "user"=$1
      )  as sell_available`,
      [res.locals.user.id]
    )
  } else if (userType >= 10 && userType < 20) {
    result = await db.query(
      `SELECT
      ( SELECT COUNT(*) FROM books WHERE status=0 )  as count0,
      ( SELECT COUNT(*) FROM books WHERE status=1 )  as count1,
      ( SELECT COUNT(*) FROM books WHERE status=2 )  as count2,
      ( SELECT COUNT(*) FROM books WHERE status=3 )  as count3,
      ( SELECT COUNT(DISTINCT "user") FROM books WHERE status=3 ) as usercount3,
      ( SELECT COUNT(*) FROM books WHERE status=4 )  as count4,
      ( SELECT SUM(price) FROM books WHERE status=0 )  as price0,
      ( SELECT SUM(price) FROM books WHERE status=1 )  as price1,
      ( SELECT SUM(price) FROM books WHERE status=2 )  as price2,
      ( SELECT SUM(price) FROM books WHERE status=3 )  as price3,
      ( SELECT SUM(price) FROM books WHERE status=4 )  as price4`
    )
  } else if (userType === 42) {
    result = await db.query(
      `SELECT
      ( SELECT COUNT(*) FROM books WHERE status=0 )  as count0,
      ( SELECT COUNT(*) FROM books WHERE status=1 )  as count1,
      ( SELECT COUNT(*) FROM books WHERE status=2 )  as count2,
      ( SELECT COUNT(*) FROM books WHERE status=3 )  as count3,
      ( SELECT SUM(price) FROM books WHERE status=0 )  as price0,
      ( SELECT SUM(price) FROM books WHERE status=1 )  as price1,
      ( SELECT SUM(price) FROM books WHERE status=2 )  as price2,
      ( SELECT SUM(price) FROM books WHERE status=3 )  as price3`
    )
  } else {
    res.status(500).json({
      success: false,
      data: 'No dashboard'
    })
    return
  }

  if (result.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Invalid query'
    })
    return
  }

  res.json({
    success: true,
    data: result.rows[0]
  })
})

/*router.post('/get/:user', function(req, res) {

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
})*/

router.post('/edit/profile', async (req, res) => {
  var original = res.locals.user;
  if (req.body.firstname != null) {
    original.firstname = req.body.firstname.trim()
  }
  if (req.body.lastname != null) {
    original.lastname = req.body.lastname.trim()
  }
  if (req.body.email != null) {
    original.email = req.body.email.trim()
  }

  const updateResult = await db.query(`
    UPDATE users
    SET
      firstname = $1,
      lastname = $2,
      email = $3
    WHERE
      id = $4`,
    [
      original.firstname,
      original.lastname,
      original.email,
      original.id
    ]
  )
  if (updateResult.rowCount != 1) {
    return res.status(500).json({
      success: false,
      data: 'Can\'t update account details'
    })
  }

  return res.json({ success: true });
})
