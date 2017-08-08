require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()

module.exports = router

router.post('/', async (req, res) => {
  const deleteResult = await db.query(
    'DELETE FROM tokens WHERE "user" = $1 AND "content" = $2',
    [res.locals.user.id, req.body.token]
  )

  if (deleteResult.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Deletable token not found'
    })
    return;
  }

  res.json({
    success: true
  })
})
