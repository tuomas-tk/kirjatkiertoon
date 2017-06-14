require('dotenv').config()
const { Pool, Client } = require('pg')
const nodemailer = require('nodemailer')
const Template_1 = require('./templates/1-thank-you-buyer');
const Template_10 = require('./templates/10-book-sold');

const TIMEOUT = 15 * 60 * 1000
const CONTINUOUS = false

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
}, {
  from: '"KirjatKiertoon.fi" <kirjatkiertoon@firmatverkkoon.fi>'
});

// pools will use environment variables
// for connection information
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


function loop() {
  pool.query('SELECT actions.*, users.email FROM actions LEFT JOIN users on actions."user"=users.id WHERE email_waiting ORDER BY time ASC').then(res => {
    console.log('Actions waiting: ' + res.rowCount)
    for (let i=0; i<res.rows.length; i++) {
      console.log('Processing action ' + i)
      let action = res.rows[i]

      let template = null
      switch (action.type) {
        case 1:
          template = new Template_1(action)
          break
        case 10:
          template = new Template_10(action)
          break
      }

      if (template == null) {
        console.log('[ACTION ' + action.id + '] - ERROR - No template available for type ' + action.type)
        break
      }

      template.runQueries(pool)
        .then(function () {
          return {
            from: '"KirjatKiertoon.fi" <kirjatkiertoon@firmatverkkoon.fi>',
            to: action.email, // list of receivers
            subject: template.subject, // Subject line
            text: template.text, // plain text body
            html: template.html // html body
          }
        })
        .then(mailOptions => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return;
            }
            console.log('Message %s sent: %s', info.messageId, info.response);

            pool.query(
              'UPDATE actions SET email_waiting = FALSE, email_sent = NOW() WHERE id=$1',
              [action.id]
            ).then(() => {
              console.log('Action ' + action.id + ' processed')
            })
          });
        })
        .catch(err => {
          console.log(err)
        })
    }
  }).catch(err => {
    console.log(err)
  })

  if (CONTINUOUS)
    setTimeout(loop, TIMEOUT)
}

loop()
