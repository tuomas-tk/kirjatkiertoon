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
    [receiptResult.rows[0].user]
  )
  if (receiptResult.rowCount != 1) {
    res.status(500).send('Käyttäjää ei löydy')
    return
  }
  const user = userResult.rows[0]

  const lineResult = await db.query(
    'SELECT * FROM receiptlines JOIN books ON receiptlines.object = books.id WHERE receipt = $1',
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
  doc.text('Tuomas Karjalainen')
  doc.text('Y-tunnus: 2839696-7')

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
      doc.text('on vastaanottanut sovitun maksun seuraavista kirjoista:')
      break
  }

  const columns = [
    56,
    110,
    150,
    250,
    350,
    400,
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
      doc.text('ALV', columns[5], yCoord)
      doc.text('Hinta', columns[6], yCoord)
      break
    case 2:
      doc.text('Myyntihinta', columns[6], yCoord)
      break
    case 3:
      doc.text('Myyntihinta', columns[5], yCoord)
      doc.text('Saatu maksu', columns[6], yCoord)
      break
  }

  yCoord += 15
  doc.moveTo(columns[0], yCoord).lineTo(columns[7], yCoord).stroke()
  yCoord += 5

  doc.font('Times-Roman')
  var totalVAT = 0
  var totalPrice = 0
  for (var i=0; i < lines.length; i++) {
    doc.text(lines[i].code, columns[0], yCoord)
    doc.text(lines[i].course, columns[1], yCoord)
    doc.text(lines[i].name, columns[2], yCoord)
    doc.text((lines[i].publisher || '-') + ', ' + (lines[i].year || '-'), columns[3], yCoord)
    doc.text(lines[i].condition + '/5', columns[4], yCoord)
    switch (receipt.type) {
      case 1:
        var VAT = lines[i].price / (1 + Static.VAT.book) * Static.VAT.book
        var price = lines[i].price // contains VAT
        totalVAT += VAT
        totalPrice += price
        doc.text((VAT / 100.0).toFixed(2) + ' €', columns[5], yCoord)
        doc.text((price / 100).toFixed(2) + ' €', columns[6], yCoord)
        break
      case 2:
        doc.text((lines[i].price / 100.0).toFixed(2) + ' €', columns[6], yCoord)
        break
      case 3:
        doc.text((lines[i].price / 100.0).toFixed(2) + ' €', columns[5], yCoord)
        doc.text(((lines[i].price - Static.TOTAL_FEE)/100.0).toFixed(2) + ' €', columns[6], yCoord)
        break
    }
    yCoord += 15
  }

  totalVAT = Math.round(totalVAT)

  switch (receipt.type) {
    case 1:
      yCoord += 15
      doc.moveTo(columns[5], yCoord).lineTo(columns[7], yCoord).stroke()
      yCoord += 5
      doc.text('Veroton:', columns[5], yCoord)
      doc.text(((totalPrice - totalVAT)/100.0).toFixed(2) + ' €', columns[6], yCoord)
      yCoord += 15
      doc.text('ALV 10%:', columns[5], yCoord)
      doc.text(((totalVAT)/100.0).toFixed(2) + ' €', columns[6], yCoord)
      yCoord += 15
      doc.text('YHTEENSÄ:', columns[5], yCoord)
      doc.text((totalPrice/100.0).toFixed(2) + ' €', columns[6], yCoord)
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
      break
  }


  doc.moveTo(columns[0], 720).lineTo(columns[7], 720).stroke()
  doc.text('KirjatKiertoon.fi', 56, 730)
  doc.text('Tuomas Karjalainen / FirmatVerkkoon.fi')
  doc.text('kirjatkiertoon@firmatverkkoon.fi')
  doc.text('044 324 6320')
  doc.pipe(res)
  doc.end()
})
