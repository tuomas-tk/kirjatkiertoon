require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const bookData = require('./data/book')
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

  var result = await bookData.getOwn(res.locals.user.id)

  res.json({
    success: true,
    data: result.rows
  })
})

// `/get/bought` returns **all books current user has bought** from the service
router.post('/get/bought', async (req, res) => {
  if (res.locals.user.type < 2 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

  var result = await bookData.getBought(res.locals.user.id)

  res.json({
    success: true,
    data: result.rows
  })
})

// `/get` returns all books from current users's school that are not bought
router.post('/get', async (req, res) => {
  if (res.locals.user.type < 1 || res.locals.user.type >= 10) {
    return res.status(400).json({ success: false });
  }

  var result = await bookData.getAvailableInSchool(res.locals.user.school)

  res.json({
    success: true,
    data: result.rows
  })
})

// `/get/:id` returns one book with given id from current users's school
router.post('/get/:id', async (req, res) => {
  var bookResult
  if (res.locals.user.type < 1) { // Nobody
    return res.status(400).json({ success: false });
  } else if (res.locals.user.type < 10) { // Buyers and sellers
    bookResult = await bookData.getSingleAvailableInSchoolOrBoughtOrOwned(req.params.id, res.locals.user.id, res.locals.user.school)
  } else if (res.locals.user.type < 42) { // Admins
    bookResult = await bookData.getSingleInSchool(req.params.id, res.locals.user.school)
  } else { // SuperAdmin
    bookResult = await bookData.getSingle(req.params.id)
  }

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
        school    = $4
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
  const updateBookResult = await bookData.buyUnboughtInSchool(req.params.id, userID, res.locals.user.school)

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

  var data = {
    course:    req.body.course,
    name:      req.body.name,
    price:     req.body.price,
    condition: req.body.condition,
    status:    0,
    info:      req.body.info,
    user:      res.locals.user.id,
    buyer:     null,
    publisher: req.body.publisher,
    year:      req.body.year,
    code:      null
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

  const insertResult = await bookData.add(data)

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

// `/edit` **edit an existing book**
router.post('/edit/:id', async (req, res) => {

  const oldBookResult = await bookData.getSingleInSchool(req.params.id, res.locals.user.school)

  if (res.locals.user.type < 5 || oldBookResult.rowCount != 1) {
    return res.status(400).json({ success: false });
  }

  var data = req.body.data

  if (
    data.condition < 0 ||
    data.condition > 5 ||
    data.price < 500 ||
    data.price > 10000 ||
    data.course == "" ||
    data.price == ""
  ) {
    res.status(400).json({ success: false })
    return
  }

  if (data.year === '') data.year = null
  if (data.user === '') data.user = null
  if (data.buyer === '') data.buyer = null
  if (data.code === '') data.code = null

  var updateResult
  if (res.locals.user.type < 10) { // Sellers
    updateResult = await bookData.editOwn(req.params.id, res.locals.user.id, data)
  } else if (res.locals.user.type < 42) { // Admins
    updateResult = await bookData.editInSchool(req.params.id, res.locals.user.school, data)
  } else { // SuperAdmin
    updateResult = await bookData.edit(req.params.id, data)
  }

  if (updateResult.rowCount != 1) {
    res.status(500).json({ success: false, data: 'Can\'t edit book' })
    return
  }

  res.json({ success: true })
})

// `/delete/:id` **removes an existing book** from the service
router.post('/delete/:id', async (req, res) => {
  var result
  if (res.locals.user.type < 5) { // buyers
    res.status(400).json({ success: false })
    return
  } else if (res.locals.user.type < 10) { // sellers
    result = await bookData.deleteOwnIfNotSold(req.params.id, res.locals.user.id)
  } else if (res.locals.user.type < 42) { // admins
    result = await bookData.deleteInSchool(req.params.id, res.locals.user.school)
  } else { // SuperAdmin
    result = await bookData.delete(req.params.id)
  }

  if (result.rowCount != 1) {
    res.status(500).json({ success: false, data: 'Can\'t delete book' })
  } else {
    res.json({ success: true })
  }
})
