require('dotenv').config()
const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()
const userData = require('./data/user')

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
     ) AND
    sell_user.school = $9
    ORDER BY status ASC, course ASC`, [
      (req.body.book.course || '%'),
      '%'+(req.body.book.name || '')+'%',
      '%'+(req.body.book.code || '')+'%',
      (req.body.book.status || '%'),
      '%'+(req.body.person.firstname || '')+'%',
      '%'+(req.body.person.lastname || '')+'%',
      '%'+(req.body.person.email || '')+'%',
      '%'+(req.body.person.passcode || '')+'%',
      res.locals.user.school
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
    lastname  LIKE $2     AND
    ` + ((res.locals.user.type < 20) ? 'school' : '$3') + ` = $3
    ORDER BY lastname ASC`,
    [
      '%'+(req.body.firstname || '')+'%',
      '%'+(req.body.lastname || '')+'%',
      res.locals.user.school
    ]
  )

  res.json({
    success: true,
    data: result.rows
  })
});

router.post('/add/user', async (req, res) => {

  var data = req.body
    /*firstname: req.body.firstname.trim(),
    lastname: req.body.lastname.trim(),
    email: req.body.email.trim(),
    type: req.body.type
  }*/
  if (data.firstname) data.firstname = data.firstname.trim()
  if (data.lastname) data.lastname = data.lastname.trim()
  if (data.email) data.email = data.email.trim()
  if (data.passcode) data.passcode = data.passcode.trim()

  if (data.lastname === '') data.lastname = null
  if (data.passcode === '') data.passcode = null
  if (data.email === '') data.email = null

  if (!data.type || !data.firstname || (data.type != 1 && !data.lastname)) {
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
  )

  if (emailInUse.rows[0].count != 0) {
    res.status(409).json({
      success: false,
      data: 'Email already in use'
    })
    return
  }

  const insertResult = await db.query(`
    INSERT INTO users
      (type, firstname, lastname, email, passcode, school)
    VALUES
      ($1, $2, $3, $4, $5, $6)`,
    [data.type, data.firstname, data.lastname, data.email, data.passcode, res.locals.user.school]
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
      passcode: data.passcode,
      type: data.type
    }
  });
})

router.post('/edit/user/:id(\\d+)', async (req, res) => {

  var data = req.body

  if (data.firstname) data.firstname = data.firstname.trim()
  if (data.lastname) data.lastname = data.lastname.trim()
  if (data.email) data.email = data.email.trim()
  if (data.passcode) data.passcode = data.passcode.trim()

  if (data.lastname === '') data.lastname = null
  if (data.passcode === '') data.passcode = null
  if (data.email === '') data.email = null

  if (!data.type || !data.firstname || (data.type != 1 && !data.lastname)) {
    res.status(400).json({ success: false })
    return
  }
  data.type = parseInt(data.type)
  if (isNaN(data.type)) {
    return res.status(400).json({ succees: false, data: 'Type is not a number' })
  }


  var oldUserResult
  if (res.locals.user.type < 10 || res.locals.user.type < data.type) {
    return res.status(403).json({ success: false })
  } else if (res.locals.user.type < 42) {
    oldUserResult = await userData.getSingleInSchool(req.params.id, res.locals.user.school)
  } else {
    oldUserResult = await userData.getSingle(req.params.id)
  }

  if (oldUserResult.rowCount != 1) return res.status(403).json({ success: false })

  if (data.email && oldUserResult.rows[0].email !== data.email) {
    const emailInUse = await db.query(`
      SELECT COUNT(*)
      FROM users
      WHERE
        email = $1 AND
        id <> $2 `,
      [data.email, req.params.id]
    )

    if (emailInUse.rows[0].count != 0) {
      res.status(409).json({
        success: false,
        data: 'Email already in use'
      })
      return
    }
  }

  data.school = oldUserResult.rows[0].school

  var updateResult
  if (res.locals.user.type < 42) {
    updateResult = await userData.editInSchool(req.params.id, res.locals.user.school, data)
  } else {
    updateResult = await userData.edit(req.params.id, data)
  }

  if (updateResult.rowCount != 1) {
    res.status(500).json({ success: false })
    return
  }
  res.json({ success: true });
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
      ) AND
      school = $2
    ORDER BY lastname ASC, firstname ASC
    LIMIT 5`,
    [
      '%' + (req.body.search || '') + '%',
      res.locals.user.school
    ]
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
    SELECT books.id, course, name, price, condition, info, publisher, year FROM books
    LEFT JOIN users ON books."user" = users.id
    WHERE
      "user" = $1 AND
      status = 1 AND
      users.school = $2
    ORDER BY id ASC`,
    [
      req.body.seller,
      res.locals.user.school
    ]
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
    SET code = last_code + 1
    FROM
      COALESCE(
        (
          SELECT code FROM books
          LEFT JOIN users ON books."user" = users.id
          WHERE
            code IS NOT NULL AND
            code != ''       AND
            users.school = $2
            ORDER BY code DESC
            LIMIT 1
          )::integer,
          99
        ) AS last_code
    WHERE
      id IN (
        SELECT b.id FROM books b
          LEFT JOIN users u
            ON b."user" = u.id
        WHERE
          b.id = $1 AND
          b.status = 1 AND
          u.school = $2
      )
    RETURNING last_code + 1 AS code`,
    [
      req.body.book,
      res.locals.user.school
    ]
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
    WHERE
      id IN (
        SELECT b.id FROM books b
        LEFT JOIN users u
          ON b."user" = u.id
        WHERE
          b.id = $1 AND
          b.code = $2 AND
          b."user" = $3 AND
          u.school = $4
      )
    `,
    [
      req.body.book,
      req.body.code,
      req.body.seller,
      res.locals.user.school
    ]
  )

  if (result.rowCount != 1) {
    res.status(400).json({
      success: false,
      data: 'Invalid book or code'
    })
    return
  }

  const findReceipt = await db.query(`
    SELECT id
    FROM receipts
    WHERE
      type = 2 AND
      status = 0 AND
      "user" = $1
    ORDER BY id DESC LIMIT 1`,
    [req.body.seller]
  )

  var receiptID
  if (findReceipt.rowCount === 0) {         // No existing receipts, create new
    const createReceipt = await db.query(`
      INSERT INTO receipts
        ("user", type, status)
      VALUES
        ($1,     2,    0     )
      RETURNING id `,
      [req.body.seller]
    )

    if (createReceipt.rowCount != 1) {
      res.status(500).json({
        success: false,
        data: 'Can\'t create receipt'
      })
      return
    }

    receiptID = createReceipt.rows[0].id

  } else {                                  // Existing receipt found, using it
    receiptID = findReceipt.rows[0].id
  }

  // Create receipt line for this book
  const addReceiptLine = await db.query(`
    INSERT INTO receiptlines
      (receipt, type, object)
    VALUES
      ($1,      2,    $2    )`,
    [receiptID, req.body.book]
  )

  if (addReceiptLine.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Can\'t create receiptline'
    })
    return
  }

  res.json({
    success: true
  })
})

router.post('/receive/finish', async (req, res) =>  {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const updateReceipt = await db.query(`
    UPDATE receipts
    SET status = 1
    WHERE
      id IN (
        SELECT r.id FROM receipts r
        LEFT JOIN users u
          ON r."user" = u.id
        WHERE
          r.type = 2 AND
          r.status = 0 AND
          r."user" = $1 AND
          u.school = $2
      )
    RETURNING id`,
    [
      req.body.seller,
      res.locals.user.school
    ]
  )

  if (updateReceipt.rowCount === 0) {
    res.status(500).json({
      success: false,
      data: 'No open receipt'
    })
    return
  }

  res.json({
    success: true,
    data: updateReceipt.rows[0].id
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
    ) AND
    school = $2
    ORDER BY lastname ASC, firstname ASC
    LIMIT 5`,
    [
      '%' + (req.body.search || '') + '%',
      res.locals.user.school
    ]
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

  const userResult = await db.query(`
    SELECT id FROM users
    WHERE
      id     = $1 AND
      school = $2
    LIMIT 1`,
    [
      req.body.buyer,
      res.locals.user.school
    ]
  )
  if (userResult.rowCount != 1) {
    return res.status(403).json({ sucess: false })
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

  const userResult = await db.query(`
    SELECT id FROM users
    WHERE
      id     = $1 AND
      school = $2
    LIMIT 1`,
    [
      req.body.buyer,
      res.locals.user.school
    ]
  )
  if (userResult.rowCount != 1) {
    return res.status(403).json({ sucess: false })
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

  const createReceipt = await db.query(`
    INSERT INTO receipts
      ("user", type, status, cash)
    VALUES
      ($1,     1,    0,      $2  )
    RETURNING id `,
    [req.body.buyer, req.body.receivedMoney]
  )

  if (createReceipt.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Can\'t create receipt'
    })
    return
  }

  var receiptID = createReceipt.rows[0].id

  for (var i=0; i < success.length; i++) {
    // Create receipt line for this book
    let addReceiptLine = await db.query(`
      INSERT INTO receiptlines
        (receipt, type, object)
      VALUES
        ($1,      1,    $2    )`,
      [receiptID, success[i]]
    )

    if (addReceiptLine.rowCount != 1) {
      res.status(500).json({
        success: false,
        data: 'Can\'t create receiptline'
      })
      return
    }
  }

  const updateReceipt = await db.query(`
    UPDATE receipts
    SET status = 1
    WHERE
      id = $1 AND
      status = 0 AND
      "user" = $2`,
    [receiptID, req.body.buyer]
  )

  if (updateReceipt.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Can\'t close receipt'
    })
    return
  }

  res.json({
    success: (failed.length === 0),
    data: {
      success: success,
      successCodes: successCodes,
      failed: failed,
      receipt: receiptID
    }
  })
})

// PAY --------------------------------------------------------------

router.post('/pay/get/sellers', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const result = await db.query(`
    SELECT id, firstname, lastname, email, passcode,
    (SELECT COUNT(*) FROM books WHERE books."user"=users.id AND status=3) as status3,
    (SELECT COUNT(*) FROM books WHERE books."user"=users.id AND status=2) as status2,
    (SELECT COUNT(*) FROM books WHERE books."user"=users.id AND status=1) as status1
    FROM users
    WHERE
      type < 10 AND type >= 5 AND
      (
        firstname || \' \' || lastname ILIKE $1 OR
        email                          ILIKE $1 OR
        passcode                       ILIKE $1
      ) AND
      school = $2
    ORDER BY lastname ASC, firstname ASC
    LIMIT 5`,
    [
      '%' + (req.body.search || '') + '%',
      res.locals.user.school
    ]
  )

  res.json({
    success: true,
    data: result.rows
  })
})

router.post('/pay/get/books', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const userResult = await db.query(`
    SELECT id FROM users
    WHERE
      id     = $1 AND
      school = $2
    LIMIT 1`,
    [
      req.body.seller,
      res.locals.user.school
    ]
  )
  if (userResult.rowCount != 1) {
    return res.status(403).json({ success: false })
  }

  const books = await db.query(`
    SELECT id, course, name, price, condition, info, publisher, year FROM books WHERE
    "user" = $1 AND
    status = 3
    ORDER BY id ASC`,
    [req.body.seller]
  )

  const createRecipt = await db.query(`
    INSERT INTO receipts
    (type, status, "user") VALUES
    (3,    0,      $1    )
    RETURNING id`,
    [req.body.seller]
  )
  if (createRecipt.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Can\'t add receipt'
    })
    return
  }
  const receiptID = createRecipt.rows[0].id

  for (let i = 0; i < books.rows.length; i++) {
    let addLine = await db.query(`
      INSERT INTO receiptlines
      (receipt, type, object) VALUES
      ($1,      3,    $2    )`,
      [receiptID, books.rows[i].id]
    )

    if (addLine.rowCount != 1) {
      res.status(500).json({
        success: false,
        data: 'Can\'t add receiptline'
      })
      return
    }
  }

  res.json({
    success: true,
    data: {
      books: books.rows,
      receipt: receiptID,
    }
  })
})

router.post('/pay/add/discount', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const userCheckResult = await db.query(`
    SELECT r.id FROM receipts r
    LEFT JOIN users u
      ON r."user" = u.id
    WHERE
      r.id     = $1 AND
      r.type   = 3  AND
      r.status = 0  AND
      u.school = $2
    LIMIT 1`,
    [
      req.body.receipt,
      res.locals.user.school
    ]
  )
  if (userCheckResult.rowCount != 1) {
    return res.status(403).json({ sucess: false })
  }

  const result = await db.query(`
    INSERT INTO receiptlines
    (receipt, type, comment, amount) VALUES
    ($1, $2, $3, $4)`,
    [req.body.receipt, req.body.type, req.body.comment, req.body.amount]
  )
  if (result.rowCount != 1) {
    res.status(500).json({
      success: false,
      data: 'Can\'t add discount'
    })
    return
  } else {
    res.json({
      success: true
    })
  }
})

router.post('/pay/delete/discount', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const userCheckResult = await db.query(`
    SELECT r.id FROM receipts r
    LEFT JOIN users u
      ON r."user" = u.id
    WHERE
      r.id     = $1 AND
      r.type   = 3  AND
      r.status = 0  AND
      u.school = $2
    LIMIT 1`,
    [
      req.body.receipt,
      res.locals.user.school
    ]
  )
  if (userCheckResult.rowCount != 1) {
    return res.status(403).json({ sucess: false })
  }

  const result = await db.query(`
    DELETE FROM receiptlines
    WHERE id = $1 AND receipt = $2`,
    [req.body.id, req.body.receipt]
  )
  if (result.rowCount != 1) {
    res.status(400).json({
      success: false,
      data: 'Can\'t delete discount'
    })
  } else {
    res.json({
      success: true
    })
  }
})

router.post('/pay/get/discounts', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const userCheckResult = await db.query(`
    SELECT r.id FROM receipts r
    LEFT JOIN users u
      ON r."user" = u.id
    WHERE
      r.id     = $1 AND
      r.type   = 3  AND
      r.status = 0  AND
      u.school = $2
    LIMIT 1`,
    [
      req.body.receipt,
      res.locals.user.school
    ]
  )
  if (userCheckResult.rowCount != 1) {
    return res.status(403).json({ sucess: false })
  }

  const result = await db.query(`
    SELECT * FROM receiptlines WHERE
    receipt = $1 AND
    type >= 100
    ORDER BY id ASC`,
    [req.body.receipt]
  )

  res.json({
    success: true,
    data: result.rows
  })
})

router.post('/pay/set/paid', async (req, res) => {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const userCheckResult = await db.query(`
    SELECT r.id FROM receipts r
    LEFT JOIN users u
      ON r."user" = u.id
    WHERE
      r.id     = $1 AND
      r.type   = 3  AND
      r.status = 0  AND
      u.school = $2
    LIMIT 1`,
    [
      req.body.receipt,
      res.locals.user.school
    ]
  )
  if (userCheckResult.rowCount != 1) {
    return res.status(403).json({ sucess: false })
  }

  const receiptLines = await db.query(`
    SELECT object FROM receiptlines
    WHERE receipt = $1 AND type = 3`,
    [req.body.receipt]
  )

  for (let i = 0; i < receiptLines.rows.length; i++) {
    let updateBook = await db.query(`
      UPDATE books SET status=4
      WHERE id = $1`,
      [receiptLines.rows[i].object]
    )
  }

  const result = await db.query(`
    UPDATE receipts SET
    status = 1
    WHERE id = $1`,
    [req.body.receipt]
  )

  if (result.rowCount != 1) {
    res.status(400).json({
      success: false,
      data: 'Can\'t update receipt'
    })
    return
  }

  res.json({
    success: true
  })
})


// RECEIPT EMAIL ---------------------------------------------------------------

router.post('/receipt/email', async (req, res) =>  {
  if (res.locals.user.type < 10) {
    return res.status(403).json({ success: false })
  }

  const checkReceipt = await db.query(`
    SELECT COUNT(r.id) FROM receipts r
    LEFT JOIN users u
      ON r."user" = u.id
    WHERE
      r."user" = $1 AND
      r.id = $2 AND
      r.status = 1 AND
      u.school = $3`,
    [
      req.body.user,
      req.body.receipt,
      res.locals.user.school
    ]
  )

  if (checkReceipt.rows[0].count != 1) {
    res.status(400).json({
      success: false,
      data: 'No receipt found'
    })
    return
  }

  if (req.body.email != undefined && req.body.email.length > 0) {
    const updateEmail = await db.query(`
      UPDATE users
      SET
        email = $1
      WHERE
        id = $2`,
      [req.body.email, req.body.user]
    )
    if (updateEmail.rowCount != 1) {
      if (insertAction.rowCount === 0) {
        res.status(500).json({
          success: false,
          data: 'Can\'t update email'
        })
        return
      }
    }
  }

  const insertAction = await db.query(`
    INSERT INTO actions
      (type, "user", object)
    VALUES
      (100,  $1,     $2    )`,
    [req.body.user, req.body.receipt]
  )

  if (insertAction.rowCount === 0) {
    res.status(500).json({
      success: false,
      data: 'Can\'t add action'
    })
    return
  }

  res.json({
    success: true
  })
})
