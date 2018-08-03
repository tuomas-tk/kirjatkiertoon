require('dotenv').config()
const db = require('../db')


exports.getSingleInSchool = (id, schoolID) => {
  return db.query(`
    SELECT *
    FROM users
    WHERE
      id = $1 AND
      school = $2
    LIMIT 1`,
    [
      id,
      schoolID
    ]
  )
}

exports.getSingle = (id) => {
  return db.query(`
    SELECT * FROM users
    WHERE id = $1
    LIMIT 1`,
    [id]
  )
}

exports.editInSchool = (id, schoolID, data) => {
  return db.query(`
    UPDATE users
    SET (firstname, lastname, email, type, passcode) =
      ($1, $2, $3, $4, $5)
    WHERE id = $6 AND school = $7
    RETURNING id`,
    [data.firstname, data.lastname, data.email, data.type, data.passcode, id, schoolID]
  )
}

exports.edit = (id, data) => {
  return db.query(`
    UPDATE books
    SET (firstname, lastname, email, type, passcode, school) =
      ($1, $2, $3, $4, $5, $6)
    WHERE id = $7
    RETURNING id`,
    [data.firstname, data.lastname, data.email, data.type, data.passcode, data.school, id]
  )
}
