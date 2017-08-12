const BaseTemplate = require('./Template')
const db = require('./../../db')
const crypto = require('crypto');

class Template extends BaseTemplate {
  constructor(action) {
    super(action)
    this._subject = 'Kuitti KirjatKiertoon.fi -palvelusta';
    this._textTemplate = `
Hei {{ user.firstname }}!
-  -  -  -  -  -  -  -  -

Tästä linkistä voit ladata itsellesi kuitin asioinnistasi KirjatKiertoon.fi -palvelussa:
{{ link }}

Linkki on voimassa 30 päivän ajan, jonka jälkeen tositetta ei ole enää mahdollista ladata. Säilytystä varten tallenna tiedosto itsellesi.

-  -  -  -  -  -  -  -  -

Kiitos että olet käyttänyt KirjatKiertoon.fi -palvelua!
Voit lähettää palautetta ja kehitysehdotuksia vastaamalla tähän viestiin.

Terveisin,
Tuomas Karjalainen
tuomas@firmatverkkoon.fi
KirjatKiertoon.fi  /  FirmatVerkkoon.fi
`
    this._htmlTemplate = `
<h1>Hei {{ user.firstname }}!</h1>
<p>
Tästä linkistä voit ladata itsellesi kuitin asioinnistasi KirjatKiertoon.fi -palvelussa:
</p>
<p>
<a href="{{ link }}">{{ link }}</a>
</p>
<p>
Linkki on voimassa 30 päivän ajan, jonka jälkeen tositetta ei ole enää mahdollista ladata. Säilytystä varten tallenna tiedosto itsellesi.
</p>
<hr />
<p>
<b>Kiitos että olet käyttänyt KirjatKiertoon.fi -palvelua!</b><br>
Voit lähettää palautetta ja kehitysehdotuksia vastaamalla tähän viestiin.
</p>
<p>
Terveisin,<br>
Tuomas Karjalainen<br>
<a href="mailto:tuomas@firmatverkkoon.fi">tuomas@firmatverkkoon.fi</a><br>
<a href="https://kirjatkiertoon.fi">KirjatKiertoon.fi</a>  /  <a href="https://firmatverkkoon.fi">FirmatVerkkoon.fi</a>
</p>
<style>
</style>
`
  }

  runQueries() {
    const token = crypto.randomBytes(40).toString('hex')
    return db.query('SELECT * FROM USERS WHERE id=$1', [this._user])
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.user = res.rows[0]
        }
      })
      .then(() => db.query('INSERT INTO receipttokens (receipt, content) VALUES ($1, $2) RETURNING content', [this._object, token]))
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.link = 'http://localhost:8080/api/receipt/' + res.rows[0].content
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

module.exports = Template;
