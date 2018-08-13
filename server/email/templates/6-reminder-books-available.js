const BaseTemplate = require('./Template')
const db = require('./../../db')

class Template extends BaseTemplate {
  constructor(action) {
    super(action)
    this._subject = 'Ostamasi kirjat ovat nyt saatavilla';
    this._textTemplate = `
Hei {{ user.firstname }}!
-  -  -  -  -  -  -  -  -

Nämä KirjatKiertoon.fi -palvelun kautta ostamasi kirjat ovat nyt saatavilla!

{% for b in books %}
 - {{ b.course }} - {{ b.name }} - {{ (b.price/100)|number_format(2, ',') }} €
{% endfor %}

Kirjojen hinta on yhteensä {{ (totalPrice/100)|number_format(2, ',') }} €.
Voit maksaa käteisellä kirjojen haun yhteydessä, tai tilisiirrolla sen jälkeen.

- - - - - - - - - -

Kiitos että olet käyttänyt KirjatKiertoon.fi -palvelua!
Voit lähettää palautetta ja kehitysehdotuksia vastaamalla tähän viestiin.

Terveisin,
Tuomas Karjalainen
kirjatkiertoon@firmatverkkoon.fi
KirjatKiertoon.fi  /  FirmatVerkkoon.fi
`
    this._htmlTemplate = `
<h1>Hei {{ user.firstname }}!</h1>
<p>
<a href="https://kirjatkiertoon.fi">KirjatKiertoon.fi</a> -palvelun kautta ostamasi kirjat ovat nyt saatavilla:
</p>
<table>
  <tr>
    <th>Kurssi:</td>
    <th>Nimi:</td>
    <th>Hinta:</td>
  </tr>
  {% for b in books %}
    <tr>
      <td>{{ b.course }}</td>
      <td>{{ b.name }}</td>
      <td>{{ (b.price/100)|number_format(2, ',') }} €</td>
    </tr>
  {% endfor %}
</table>
<h2>
Kirjojen hinta on yhteensä {{ (totalPrice/100)|number_format(2, ',') }} €.
Voit maksaa käteisellä kirjojen haun yhteydessä, tai tilisiirrolla sen jälkeen.
</h2>
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
table {
  width: 100%;
  border: 1px solid #000000;
  border-collapse: collapse;
}
th {
  background-color: #444444;
  color: #FFFFFF;
  text-align: left;
  padding: 10px 10px;
}
td {
  padding: 8px 10px;
  border: 1px solid #aaaaaa;
}
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
      .then(() => db.query('SELECT * FROM books WHERE "buyer"=$1 AND status=2', [this._user]))
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.books = res.rows

          this._data.totalPrice = 0
          for (var i=0; i < this._data.books.length; i++) {
            this._data.totalPrice += this._data.books[i].price
          }
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

module.exports = Template;
