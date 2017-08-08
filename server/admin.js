require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()

module.exports = router

router.post('/get/books', async (req, res) => {
  if (res.locals.user.type < 10) {
    res.status(403).json({
      success: false
    })
    return
  }

  const result = await db.query(`
    SELECT
     books.*,
     sell_user.firstname::text || \' \' || sell_user.lastname as seller,
     buy_user.firstname  || \' \' || buy_user.lastname  as buyer
    FROM books
    LEFT JOIN users as sell_user
     ON sell_user.id = books."user"
    LEFT JOIN users as buy_user
     ON buy_user.id = books.buyer
    WHERE
     COALESCE(course,\'\')        ILIKE $1 AND
     COALESCE(name,\'\')          ILIKE $2 AND
     COALESCE(code,\'\')          ILIKE $3 AND
     COALESCE(status::text,\'\')  ILIKE $4 AND
     (
      (COALESCE(sell_user.firstname,\'\') ILIKE $5 AND COALESCE(sell_user.lastname,\'\') ILIKE $6 AND COALESCE(sell_user.email,\'\') ILIKE $7 AND COALESCE(sell_user.passcode,\'\') ILIKE $8) OR
      (COALESCE( buy_user.firstname,\'\') ILIKE $5 AND COALESCE( buy_user.lastname,\'\') ILIKE $6 AND COALESCE( buy_user.email,\'\') ILIKE $7 AND COALESCE( buy_user.passcode,\'\') ILIKE $8)
     )
    ORDER BY id DESC`, [
      (req.body.book.course || '%'),
      '%'+(req.body.book.name || '')+'%',
      '%'+(req.body.book.code || '')+'%',
      (req.body.book.status || '%'),
      '%'+(req.body.person.firstname || '')+'%',
      '%'+(req.body.person.lastname || '')+'%',
      '%'+(req.body.person.email || '')+'%',
      '%'+(req.body.person.passcode || '')+'%'
    ]
  )

  res.json({
    success: true,
    data: result.rows
  })
})

router.post('/get/users', async (req, res) => {
  if (res.locals.user.type < 10) {
    res.status(403).json({ success: false })
    return
  }

  const result = await db.query(`
    SELECT * FROM users WHERE
    type < 100            AND
    firstname LIKE $1     AND
    lastname  LIKE $2
    ORDER BY lastname ASC`,
    [
      '%'+(req.body.firstname || '')+'%',
      '%'+(req.body.lastname || '')+'%'
    ]
  )

  res.json({
    success: true,
    data: result.rows
  })
});

router.post('/add/user', async (req, res) => {

  var data = {
    firstname: req.body.firstname.trim(),
    lastname: req.body.lastname.trim(),
    email: req.body.email.trim(),
    type: req.body.type
  }

  if (data.type == null || data.type == '' || data.firstname == null || data.firstname == '') {
    res.status(400).json({ success: false })
    return
  }

  if (res.locals.user.type < 10 || res.locals.user.type < data.type) {
    return res.status(403).json({ success: false })
  }

  const emailInUse = await db.query(`
    SELECT COUNT(*)
    FROM users
    WHERE
      email = $1 AND
      $1 <> '' `,
    [data.email]
  ).count != 0

  if (emailInUse) {
    res.status(409).json({
      success: false,
      data: 'Email already in use'
    })
    return
  }

  //var identifier = crypto.randomBytes(128).toString('hex');
  var possible = "abcdefghijklmnopqrstuvwxyz1234567890"; // 36 characters

  var passcode = '';
  for( var i=0; i < 8; i++ ) {
    passcode += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  const insertResult = await db.query(`
    INSERT INTO users
      (type, firstname, lastname, email, passcode, school)
    VALUES
      ($1, $2, $3, $4, $5, $6)`,
    [data.type, data.firstname, data.lastname, data.email, passcode, 1]
  )

  if (insertResult.rowCount != 1) {
    res.status(500).json({ success: false })
    return
  }

  res.json({
    success: true,
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      type: data.type,
      passcode: passcode
    }
  });
})

router.post('/receive/get/sellers', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const result = await db.query(`
    SELECT id, firstname, lastname, email, passcode FROM users WHERE
      type < 10 AND type >= 5 AND
      (
        firstname || \' \' || lastname ILIKE $1 OR
        email                          ILIKE $1 OR
        passcode                       ILIKE $1
      )
    ORDER BY lastname ASC, firstname ASC
    LIMIT 5`,
    ['%' + (req.body.search || '') + '%']
  )

  res.json({
    success: true,
    data: result.rows
  })
})

router.post('/receive/get/books', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const result = await db.query(`
    SELECT id, course, name, price, condition, info, publisher, year FROM books WHERE
    "user" = $1 AND
    status = 1
    ORDER BY id ASC`,
    [req.body.seller]
  )

  res.json({
    success: true,
    data: result.rows
  })
})

router.post('/receive/get/code', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const result = await db.query(`
    UPDATE books
    SET code = next_code + 1
    FROM
     COALESCE(
       (
         SELECT code FROM books
         WHERE code IS NOT NULL
         ORDER BY code DESC
         LIMIT 1
       )::integer,
       99
     ) AS next_code
    WHERE id = $1 AND
     status = 1
    RETURNING next_code + 1 AS code`,
    [req.body.book]
  )

  res.json({
    success: true,
    data: result.rows[0]['code']
  })
})

router.post('/receive/set/received', async (req, res) =>  {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const result = await db.query(`
    UPDATE books
    SET status = 2
    WHERE id = $1 AND code = $2`,
    [req.body.book, req.body.code]
  )

  if (result.rowCount != 1) {
    res.status(400).json({
      success: false,
      data: 'Invalid book or code'
    })
    return
  }

  res.json({
    success: true
  })
})


router.post('/deliver/get/buyers', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const result = await db.query(`
    SELECT id, firstname, lastname, email FROM users WHERE
    type < 10 AND type >= 2 AND
    (
     firstname || \' \' || lastname ILIKE $1 OR
     email                          ILIKE $1
    )
    ORDER BY lastname ASC, firstname ASC
    LIMIT 5`,
    ['%' + (req.body.search || '') + '%']
  )

  res.json({
    success: true,
    data: result.rows
  })
})

router.post('/deliver/get/books', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const availableResult = await db.query(`
    SELECT id, code, course, name, price, condition, info, publisher, year FROM books WHERE
     buyer = $1 AND
     status = 2
    ORDER BY code ASC`,
    [req.body.buyer]
  )

  const comingResult = await db.query(`
    SELECT id, course, name, price, condition, info, publisher, year FROM books WHERE
     buyer = $1 AND
     status = 1
    ORDER BY code ASC`,
    [req.body.buyer]
  )

  res.json({
    success: true,
    data: {
      available: availableResult.rows,
      coming: comingResult.rows
    }
  })
})

router.post('/deliver/set/delivered', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const books = req.body.books
  var success = []
  var successCodes = []
  var failed = []

  for (var i=0; i < books.length; i++) {
    let result = await db.query(`
      UPDATE books
      SET status = 3
      WHERE id = $1 AND buyer = $2 AND status = 2
      RETURNING code`,
      [books[i], req.body.buyer]
    )
    if (result.rowCount != 1) {
      failed.push(books[i])
    } else {
      success.push(books[i])
      successCodes.push(result.rows[0].code)
    }
  }

  res.json({
    success: (failed.length === 0),
    data: {
      success: success,
      successCodes: successCodes,
      failed: failed
    }
  })
})
