require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()

module.exports = router

router.all('*', async (req, res, next) => {
  const tokenResult = await db.query(
    'SELECT "user" FROM tokens WHERE content = $1 LIMIT 1',
    [req.body.token]
  )

  if (tokenResult.rowCount != 1) {
    res.status(400).json({
      success: false,
      data: 'Invalid token'
    })
    return;
  }

  const userResult = await db.query(
    'SELECT * FROM "users" WHERE id = $1 LIMIT 1',
    [tokenResult.rows[0].user]
  )

  if (userResult.rowCount != 1 || userResult.rows[0].type < 1) {
    res.status(500).json({
      success: false,
      data: 'User not found'
    })
    return;
  }

  res.locals.user = userResult.rows[0]
  next()
})
