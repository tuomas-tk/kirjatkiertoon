require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()
const crypto = require('crypto');

router.post('/', async (req, res) => {

  const userResult = await db.query(
    'SELECT id, type, firstname, lastname, email FROM users WHERE passcode = $1 LIMIT 1',
    [req.body.passcode]
  )

  if (userResult.rowCount != 1) {
    res.status(400).json({
      success: false,
      data: 'Invalid passcode'
    })
    return;
  }

  const token = crypto.randomBytes(64).toString('hex')

  const insertResult = await db.query(
    'INSERT INTO tokens("user", content) VALUES($1, $2)',
    [userResult.rows[0].id, token]
  )

  if (insertResult.rowCount != 1) {
    res.status(500).json({
      success: false
    })
    return;
  }

  res.json({
    success: true,
    data: {
      user: userResult.rows[0],
      token: token
    }
  })
})

module.exports = router;
