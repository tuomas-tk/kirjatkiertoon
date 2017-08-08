require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()

module.exports = router

router.post('/get/own', async (req, res) => {
  if (res.locals.user.type < 5 || res.locals.user.type >= 10) {
    res.status(400).json({ success: false })
    return
  }

  const bookResult = await db.query(`
    SELECT *
    FROM books
    WHERE
      "user" = $1
    ORDER BY
      CASE status
        WHEN 1
          THEN 0
        ELSE 1
      END ASC,
      status ASC,
      id DESC
    `,
    [res.locals.user.id]
  )

  res.json({
    success: true,
    data: bookResult.rows
  })
})

router.post('/get/bought', async (req, res) => {
  if (res.locals.user.type < 2 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

  const bookResult = await db.query(`
    SELECT *
    FROM books
    WHERE
      "buyer" = $1
    ORDER BY
      CASE status
        WHEN 2
          THEN 0
        ELSE 1
      END ASC,
      status ASC,
      id DESC
    `,
    [res.locals.user.id]
  )

  res.json({
    success: true,
    data: bookResult.rows
  })
})

router.post('/get', async (req, res) => {
  if (res.locals.user.type < 1 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

  const bookResult = await db.query(`
    SELECT *
    FROM books
    WHERE
      buyer IS NULL
    ORDER BY
      price ASC,
      id ASC`
  )

  res.json({
    success: true,
    data: bookResult.rows
  })
})

router.post('/get/:id', async (req, res) => {
  if (res.locals.user.type < 1 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }
  const bookResult = await db.query(`
    SELECT id, course, name, price, condition, status, info, publisher, year
    FROM books
    WHERE
      id = $1
    LIMIT 1`,
    [req.params.id]
  )

  res.json({
    success: true,
    data: bookResult.rows[0]
  })
})


router.post('/buy/:id', async (req, res) => {

  var userID

  if (res.locals.user.type === 1) { // school account
    // does the same user already have an personal account
    const existingAccountResult = await db.query(`
      SELECT id
      FROM users
      WHERE
        firstname = $1 AND
        lastname  = $2 AND
        email     = $3 AND
        type      = 2
      LIMIT 1`,
      [req.body.firstname.trim(), req.body.lastname.trim(), req.body.email.trim()]
    )

    if (existingAccountResult.rowCount === 0) { // no existing account
      // create account
      const createAccountResult = await db.query(`
        INSERT INTO users(
          type, firstname, lastname, email, passcode, school
        ) VALUES (
          2,    $1,        $2,       $3,    $4,       $5
        ) RETURNING id`,
        [req.body.firstname.trim(), req.body.lastname.trim(), req.body.email.trim(), null, res.locals.user.school]
      )
      if (createAccountResult.rowCount != 1) {
        res.status(500).json({ success: false, data: 'Can\'t create new account' })
        return
      }
      userID = createAccountResult.rows[0].id
    } else { // existing account found
      userID = existingAccountResult.rows[0].id
    }

  } else if (res.locals.user.type >= 2 || res.locals.user.type < 10) { // personal account
    userID = res.locals.user.id
  } else {
    res.status(400).json({ success: false });
    return
  }

  const updateBookResult = await db.query(`
    UPDATE books
    SET
      buyer = $1,
      status =  CASE
                  WHEN status = 0 THEN 1
                  ELSE status
                END
    WHERE
      id = $2 AND
      buyer IS NULL AND
      "user" != $1
    RETURNING
      "user"
    `,
    [userID, req.params.id]
  )

  if (updateBookResult.rowCount != 1) {
    res.status(500).json({ success: false, data: 'Can\'t update book' })
    return
  }

  const insertActionResult = await db.query(`
    INSERT
    INTO
      actions
      (type, "user", object)
    VALUES
      (1, $1, $2),
      (10, $3, $2)
    `,
    [userID, req.params.id, updateBookResult.rows[0].user]
  )

  res.json({
    success: true
  })
})

router.post('/add/', async (req, res) => {

  var data = {
    course:    req.body.course,
    name:      req.body.name,
    publisher: req.body.publisher,
    year:      req.body.year,
    price:     req.body.price,
    condition: req.body.condition,
    info:      req.body.info
  };

  if (
    data.condition < 0 ||
    data.condition > 5 ||
    data.price < 500 ||
    data.price > 10000 ||
    data.course == "" ||
    data.price == "" ||
    res.locals.user.type < 5 ||
    res.locals.user.type >= 10
  ) {
    res.status(400).json({ success: false })
    return
  }

  const insertResult = await db.query(`
    INSERT INTO books
      (course, name, publisher, year, price, condition, info, "user", status)
    values
      ($1, $2, $3, $4, $5, $6, $7, $8, 0)
    RETURNING id`,
    [data.course, data.name, data.publisher, data.year, data.price, data.condition, data.info, res.locals.user.id]
  )

  if (insertResult.rowCount != 1) {
    res.status(500).json({ success: false, data: 'Can\'t insert book' })
    return
  }

  res.json({
    success: true,
    data: {
      id: insertResult.rows[0].id
    }
  })
})
