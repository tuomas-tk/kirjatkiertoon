const BaseTemplate = require('./Template')
const db = require('./../../db')

class Template extends BaseTemplate {
  constructor(action) {
    super(action)
    this._subject = 'Kuitti KirjatKiertoon.fi -palvelusta';
    this._textTemplate = `
Hei {{ user.firstname }}!
-  -  -  -  -  -  -  -  -

Tämän sähköpostin liitteenä on kuitti asionnistasi KirjatKiertoon.fi -palvelussa.

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
Tämän sähköpostin liitteenä on kuitti asioinnistasi KirjatKiertoon.fi -palvelussa
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
    return db.query('SELECT * FROM USERS WHERE id=$1', [this._user])
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.user = res.rows[0]
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

module.exports = Template;
