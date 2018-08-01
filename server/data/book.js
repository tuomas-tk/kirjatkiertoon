require('dotenv').config()
const db = require('../db')

// Returns all books owned by specified user.
// Books with status 1 (bought, bring to school) are listed first, then the others with ascending statuses
exports.getOwn = (userID) => {
  return db.query(`
    SELECT *
    FROM books
    WHERE
      "user" = $1 AND
      status >= 0
    ORDER BY
      CASE status
        WHEN 1
          THEN 0
        ELSE 1
      END ASC,
      status ASC,
      id DESC
    `,
    [userID]
  )
}

// Returns all books current user has bought
// Books with status 2 (get from school) are listed first, then the others with ascending statuses
exports.getBought = (user) => {
  return db.query(`
    SELECT *
    FROM books
    WHERE
      "buyer" = $1 AND
      status >= 0
    ORDER BY
      CASE status
        WHEN 2
          THEN 0
        ELSE 1
      END ASC,
      status ASC,
      id DESC
    `,
    [user.id]
  )
}

exports.getAvailableInSchool = (schoolID) => {
  return db.query(`
    SELECT *
    FROM books b
    WHERE
      b.buyer IS NULL AND
      b.status = 0 AND
      (SELECT school FROM users WHERE id = b."user") = $1
    ORDER BY
      b.price ASC,
      b.id ASC`,
    [schoolID]
  )
}

exports.getSingleAvailableOrOwnedInSchool = (id, userID, schoolID) => {
  return db.query(`
    SELECT b.id, course, name, price, condition, status, info, publisher, year
    FROM books b
    WHERE
      id = $1 AND
      (status = 0 OR "user" = $2) AND
      (SELECT school FROM users WHERE id = b."user") = $3
    LIMIT 1`,
    [
      id,
      userID,
      schoolID
    ]
  )
}

exports.getSingleOwned = (id, userID) => {
  return db.query(`
    SELECT b.id, course, name, price, condition, status, info, publisher, year
    FROM books b
    WHERE
      id = $1 AND
      "user" = $2
    LIMIT 1`,
    [
      id,
      userID
    ]
  )
}

exports.getSingleInSchool = (id, schoolID) => {
  return db.query(`
    SELECT *
    FROM books
    WHERE
      id = $1 AND
      (SELECT school FROM users WHERE id = books."user") = $2
    LIMIT 1`,
    [
      id,
      schoolID
    ]
  )
}

exports.getSingle = (id) => {
  return db.query(`
    SELECT * FROM books
    WHERE id = $1
    LIMIT 1`,
    [id]
  )
}

exports.buyUnboughtInSchool = (id, buyerID, schoolID) => {
  return db.query(`
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
      buyerID,
      id,
      schoolID
    ]
  )
}

exports.add = (data) => {
  return db.query(`
    INSERT INTO books
      (course, name, price, condition, status, info, "user", buyer, publisher, year, code)
    values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id`,
    [data.course, data.name, data.price, data.condition, data.status, data.info, data.user, data.buyer, data.publisher, data.year, data.code]
  )
}

exports.editOwn = (id, userID, data) => {
  return db.query(`
    UPDATE books
    SET (course, name, price, condition, status, info, publisher, year) =
      ($1, $2, $3, $4, $5, $6, $7, $8)
    WHERE id = $9 AND "user" = $10
    RETURNING id`,
    [data.course, data.name, data.price, data.condition, data.status, data.info, data.publisher, data.year, id, userID]
  )
}

exports.editInSchool = (id, schoolID, data) => {
  return db.query(`
    UPDATE books
    SET (course, name, price, condition, status, info, publisher, year, "user", buyer, code) =
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    WHERE id = $12 AND (SELECT school FROM users WHERE id = books."user") = $13
    RETURNING id`,
    [data.course, data.name, data.price, data.condition, data.status, data.info, data.publisher, data.year, data.user, data.buyer, data.code, id, schoolID]
  )
}

exports.edit = (id, data) => {
  return db.query(`
    UPDATE books
    SET (course, name, price, condition, status, info, publisher, year, "user", buyer, code) =
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    WHERE id = $12
    RETURNING id`,
    [data.course, data.name, data.price, data.condition, data.status, data.info, data.publisher, data.year, data.user, data.buyer, data.code, id]
  )
}

exports.deleteOwnIfNotSold = (id, userID) => {
  return db.query(`
    UPDATE books
    SET status = -1
    WHERE id = $1 AND "user" = $2 AND status = 0`,
    [id, userID]
  )
}

exports.deleteInSchool = (id, schoolID) => {
  return db.query(`
    UPDATE books
    SET status = -1
    WHERE
      id = $1 AND
      (SELECT school FROM users WHERE id = books."user") = $2`,
    [id, schoolID]
  )
}

exports.delete = (id) => {
  return db.query(`
    UPDATE books
    SET status = -1
    WHERE
      id = $1`,
    [id]
  )
}
