require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()

module.exports = router

// /api/book
// ---------

// `/get/own` returns **all books current user has added/sold**
router.post('/get/own', async (req, res) => {
  if (res.locals.user.type < 5 || res.locals.user.type >= 10) {
    res.status(400).json({ success: false })
    return
  }

  // Books with status 1 (bought, bring to school) are listed first, then the others with ascending statuses
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

// `/get/bought` returns **all books current user has bought** from the service
router.post('/get/bought', async (req, res) => {
  if (res.locals.user.type < 2 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

  // Books with status 2 (get from school) are listed first, then the others with ascending statuses
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

// `/get` returns all books from current users's school that are not bought
router.post('/get', async (req, res) => {
  if (res.locals.user.type < 1 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

  const bookResult = await db.query(`
    SELECT *
    FROM books b
    WHERE
      b.buyer IS NULL AND
      (SELECT school FROM users WHERE id = b."user") = $1
    ORDER BY
      b.price ASC,
      b.id ASC`,
    [res.locals.user.school]
  )

  res.json({
    success: true,
    data: bookResult.rows
  })
})

// `/get/:id` returns one book with given id from current users's school
router.post('/get/:id', async (req, res) => {
  if (res.locals.user.type < 1 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }
  const bookResult = await db.query(`
    SELECT b.id, course, name, price, condition, status, info, publisher, year
    FROM books b
    WHERE
      id = $1 AND
      (SELECT school FROM users WHERE id = b."user") = $2
    LIMIT 1`,
    [
      req.params.id,
      res.locals.user.school
    ]
  )

  res.json({
    success: true,
    data: bookResult.rows[0]
  })
})

// `/buy/:id` **buys the given book.**
// User's information is supplied via POST data:
// - firstname
// - lastname
router.post('/buy/:id', async (req, res) => {
  var userID

  if (res.locals.user.type === 1) { // **Logged in with a school-wide account**
    // Check if the same user already has a personal account
    // Information suppled via POST data
    const existingAccountResult = await db.query(`
      SELECT id
      FROM users
      WHERE
        firstname = $1 AND
        lastname  = $2 AND
        email     = $3 AND
        type      = 2  AND
        school    = $3
      LIMIT 1`,
      [
        req.body.firstname.trim(),
        req.body.lastname.trim(),
        req.body.email.trim(),
        res.locals.user.school
      ]
    )

    if (existingAccountResult.rowCount === 0) { // User does not have an existing account
      // Create a new account
      const createAccountResult = await db.query(`
        INSERT INTO users(
          type, firstname, lastname, email, passcode, school
        ) VALUES (
          2,    $1,        $2,       $3,    $4,       $5
        ) RETURNING id`,
        [
          req.body.firstname.trim(),
          req.body.lastname.trim(),
          req.body.email.trim(),
          null,
          res.locals.user.school
        ]
      )
      if (createAccountResult.rowCount != 1) {
        res.status(500).json({ success: false, data: 'Can\'t create new account' })
        return
      }
      userID = createAccountResult.rows[0].id
    } else { // Existing account found -> using it
      userID = existingAccountResult.rows[0].id
    }

  } else if (res.locals.user.type >= 2 || res.locals.user.type < 10) { // **Logged in with a personal account**
    userID = res.locals.user.id
  } else {
    res.status(400).json({ success: false });
    return
  }

  // Update the book in the database
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
      (SELECT school FROM users WHERE id = books."user") = $3 AND
      "user" != $1
    RETURNING
      "user"
    `,
    [
      userID,
      req.params.id,
      res.locals.user.school
    ]
  )

  if (updateBookResult.rowCount != 1) {
    res.status(500).json({ success: false, data: 'Can\'t update book' })
    return
  }

  // Insert actions
  // - for buyer
  // - for seller
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

// `/add` **adds a new book** to the service
router.post('/add', async (req, res) => {

  if (res.locals.user.type < 5 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

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
