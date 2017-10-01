const Router = require('express-promise-router')
const db = require('./db')
const router = new Router()
const PDF = require('pdfkit')
const Static = require('./../src/Static')

module.exports = router

router.get('/:token', async (req, res) => {

  const tokenResult = await db.query(
    'SELECT receipt FROM receipttokens WHERE content = $1 LIMIT 1',
    [req.params.token]
  )
  if (tokenResult.rowCount != 1) {
    res.status(404).send('Linkki tositteeseen on vanhentunut.')
    return
  }
  const receiptID = tokenResult.rows[0].receipt


  const receiptResult = await db.query(
    'SELECT * FROM receipts WHERE id = $1 AND status = 1',
    [receiptID]
  )
  if (receiptResult.rowCount != 1) {
    res.status(500).send('Tositetta ei löydy')
    return
  }
  const receipt = receiptResult.rows[0]


  const userResult = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [receipt.user]
  )
  if (receiptResult.rowCount != 1) {
    res.status(500).send('Käyttäjää ei löydy')
    return
  }
  const user = userResult.rows[0]

  const schoolResult = await db.query(
    'SELECT * FROM schools WHERE id = $1',
    [user.school]
  )
  if (schoolResult.rowCount != 1) {
    res.status(500).send('Koulua ei löydy')
    return
  }
  const school = schoolResult.rows[0]

  const lineResult = await db.query(
    'SELECT * FROM receiptlines LEFT JOIN books ON receiptlines.object = books.id WHERE receipt = $1',
    [receiptID]
  )
  if (lineResult.rowCount === 0) {
    res.status(500).send('Tosite on tyhjä')
    return
  }
  const lines = lineResult.rows

  const time = receiptResult.rows[0].time
  const date = time.getFullYear() * 10000 + (time.getMonth() + 1) * 100 + time.getDate();

  const doc = new PDF({
    size: 'A4',
    layout: 'portrait',
    margins: {
      'top': 56,
      'right': 42,
      'bottom': 56,
      'left': 56
    }
  })

  let filename = 'tosite-' + receiptID + '-' + date
  // Stripping special characters
  filename = encodeURIComponent(filename) + '.pdf'
  // Setting response to 'attachment' (download).
  // If you use 'inline' here it will automatically open the PDF
  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"')
  res.setHeader('Content-type', 'application/pdf')

  doc.font('Times-Roman').fontSize(12)
  doc.text('KirjatKiertoon.fi')
  doc.text(school.name)
  doc.text('Järjestäjä: ' + school.organizer)

  doc.font('Times-Bold').text('KUITTI',  260 + 56, 56).font('Times-Roman')
  doc.text('\n' + time.getDate() + '.' + (time.getMonth() + 1) + '.' + time.getFullYear())
  doc.text(receiptID, 391 + 56, 56)
  doc.text('1 (1)',   456 + 56, 56)

  doc.font('Times-Bold').text(user.firstname + ' ' + user.lastname, 56, 125).font('Times-Roman')
  doc.text('(' + user.email + ')')
  doc.text(' ')
  doc.font('Times-Bold')
  switch (receipt.type) {
    case 1:
      doc.text('on ostanut, maksanut, vastaanottanut sekä hyväksynyt seuraavat kirjat:', )
      break
    case 2:
      doc.text('on tuonut toimitusta varten koululle seuraavat kirjat:')
      break
    case 3:
      doc.text('on vastaanottanut sovitun maksun seuraavista palvelun kautta myymistään kirjoista:')
      break
  }

  const columns = [
    56,
    110,
    150,
    280,
    380,
    410,
    490,
    595.28 - 42
  ]
  var yCoord = 190

  doc.font('Times-Italic')
  doc.text('Koodi', columns[0], yCoord)
  doc.text('Kurssi', columns[1], yCoord)
  doc.text('Nimi', columns[2], yCoord)
  doc.text('Kustantaja', columns[3], yCoord)
  doc.text('Kunto', columns[4], yCoord)
  switch (receipt.type) {
    case 1:
      if (school.vat)
        doc.text('ALV', columns[5], yCoord)
      doc.text('Hinta', columns[6], yCoord)
      break
    case 2:
      doc.text('Myyntihinta', columns[6], yCoord)
      break
    case 3:
      doc.text('Myyntihinta', columns[5], yCoord)
      doc.text('Tuotto', columns[6], yCoord)
      break
  }

  yCoord += 15
  doc.moveTo(columns[0], yCoord).lineTo(columns[7], yCoord).stroke()
  yCoord += 5

  doc.font('Times-Roman')
  var totalVAT = 0
  var totalPrice = 0
  for (var i=0; i < lines.length; i++) {
    if (lines[i].type < 100) {
      doc.text(lines[i].code, columns[0], yCoord)
      doc.text(lines[i].course, columns[1], yCoord)
      doc.text(lines[i].name, columns[2], yCoord, {
        width: columns[3] - columns[2],
        height: 10,
        lineBreak: false,
        ellipsis: true
      }) // tämä
      doc.text((lines[i].publisher || '-') + ', ' + (lines[i].year || '-'), columns[3], yCoord)
      doc.text(lines[i].condition + '/5', columns[4], yCoord)
      switch (receipt.type) {
        case 1:
          if (school.vat) {
            var VAT = lines[i].price / (1 + Static.VAT.book) * Static.VAT.book
            var price = lines[i].price // contains VAT
            totalVAT += VAT
            totalPrice += price
            doc.text((VAT / 100.0).toFixed(2) + ' €', columns[5], yCoord)
          }
          doc.text((price / 100).toFixed(2) + ' €', columns[6], yCoord)
          break
        case 2:
          doc.text((lines[i].price / 100.0).toFixed(2) + ' €', columns[6], yCoord)
          break
        case 3:
          doc.text((lines[i].price / 100.0).toFixed(2) + ' €', columns[5], yCoord)
          doc.text(((lines[i].price - Static.TOTAL_FEE)/100.0).toFixed(2) + ' €', columns[6], yCoord)
          if (lines[i].type === 3) {
            totalPrice += Math.round(lines[i].price - Static.TOTAL_FEE)
          } else if (lines[i].type === 100) {
            totalPrice += lines[i].amount
          } else if (lines[i].type === 110) {
            totalPrice -= lines[i].amount
          }
          break
      }
    } else if (lines[i].type === 100){
      yCoord += 5
      doc.text('LISÄTILITYS', columns[0], yCoord)
      doc.text(lines[i].comment, columns[2], yCoord)
      doc.text('+ ' + (lines[i].amount/100.0).toFixed(2) + ' €', columns[6], yCoord)
      totalPrice += lines[i].amount
    } else if (lines[i].type === 110) {
      yCoord += 5
      doc.text('LISÄVÄHENNYS', columns[0], yCoord)
      doc.text(lines[i].comment, columns[2], yCoord)
      doc.text('- ' + (lines[i].amount/100.0).toFixed(2) + ' €', columns[6], yCoord)
      totalPrice -= lines[i].amount
    }

    yCoord += 15
  }

  totalVAT = Math.round(totalVAT)

  switch (receipt.type) {
    case 1:
      yCoord += 15
      doc.moveTo(columns[5], yCoord).lineTo(columns[7], yCoord).stroke()
      if (school.vat) {
        yCoord += 5
        doc.text('Veroton:', columns[5], yCoord)
        doc.text(((totalPrice - totalVAT)/100.0).toFixed(2) + ' €', columns[6], yCoord)
        yCoord += 15
        doc.text('ALV 10%:', columns[5], yCoord)
        doc.text(((totalVAT)/100.0).toFixed(2) + ' €', columns[6], yCoord)
      }
      yCoord += 15
      doc.font('Times-Bold').text('YHTEENSÄ:', columns[5], yCoord)
      doc.text((totalPrice/100.0).toFixed(2) + ' €', columns[6], yCoord).font('Times-Roman')
      yCoord += 15
      doc.text('Käteinen:', columns[5], yCoord)
      doc.text((receipt.cash/100.0).toFixed(2) + ' €', columns[6], yCoord)
      yCoord += 15
      doc.text('Takaisin:', columns[5], yCoord)
      doc.text(((receipt.cash - totalPrice)/100.0).toFixed(2) + ' €', columns[6], yCoord)
      break

    case 2:
      doc.text('\n\n\n\n', 56, yCoord)
      doc.text('Myyjä on velvollinen ottamaan kirjat takaisin itselleen, mikäli kirjojen toimitus ostajille ei jostain syystä onnistu. ' +
             'Sovitut alennukset otetaan huomioon myöhemmin kirjojen myyntituottojen maksamisen yhteydessä.')
      break

    case 3:
      yCoord += 15
      doc.font('Times-Bold')
      doc.text('YHTEENSÄ', columns[5], yCoord)
      doc.text((totalPrice/100.0).toFixed(2) + ' €', columns[6], yCoord)
      doc.font('Times-Roman')
      yCoord += 15
      break
  }


  doc.moveTo(columns[0], 720).lineTo(columns[7], 720).stroke()
  doc.text('KirjatKiertoon.fi', 56, 730)
  doc.text(school.name)
  doc.text('Järjestäjä: ' + school.organizer)
  doc.text(school.contact)
  doc.pipe(res)
  doc.end()
})
