const BaseTemplate = require('./Template')
const db = require('./../../db')

class Template extends BaseTemplate {
  constructor(action) {
    super(action)
    this._subject = 'Vahvistus kirjaostosta';
    this._textTemplate = `
Hei {{ user.firstname }}!
-  -  -  -  -  -  -  -  -

Hienoa! Olet ostanut KirjatKiertoon.fi -palvelun kautta kirjan:
KURSSI: {{ book.course }}
NIMI:   {{ book.name }}
HINTA:  {{ (book.price / 100)|number_format(2, ',') }} €

Saat uuden viestin kun kirja on noudettavissa koululta käteismaksua vastaan.

{% if old_books %}
{% for b in old_books %}
Olet jo aiemmin ostanut nämä kirjat, jotka myös odottavat toimitusta koululle:
 - {{ b.course }} - {{ b.name }} - {{ (b.price/100)|number_format(2, ',') }} €
{% endfor %}
{% endif %}

Kiitos että olet käyttänyt KirjatKiertoon.fi -palvelua!
Voit lähettää palautetta ja kehitysehdotuksia vastaamalla tähän viestiin

Terveisin,
Tuomas Karjalainen
tuomas@firmatverkkoon.fi
KirjatKiertoon.fi  /  FirmatVerkkoon.fi
`
    this._htmlTemplate = `
<h1>Hei {{ user.firstname }}!</h1>
<h2>Hienoa! Olet ostanut <a href="https://kirjatkiertoon.fi">KirjatKiertoon.fi</a> -palvelun kautta kirjan:</h2>
<table>
  <tr>
    <th>KURSSI</td>
    <th>NIMI</td>
    <th>HINTA</td>
  </tr>
  <tr>
    <td>{{ book.course }}</td>
    <td>{{ book.name }}</td>
    <td>{{ (book.price/100)|number_format(2, ',') }} €</td>
  </tr>
</table>
<p>
<b>Saat uuden viestin kun kirja on noudettavissa koululta käteismaksua vastaan.</b>
</p>
{% if old_books %}
<hr />
<h2>Olet jo aiemmin ostanut nämä kirjat, jotka myös odottavat toimitusta koululle:</h2>
<table>
  <tr>
    <th>Kurssi:</td>
    <th>Nimi:</td>
    <th>Hinta:</td>
  </tr>
  {% for b in old_books %}
    <tr>
      <td>{{ b.course }}</td>
      <td>{{ b.name }}</td>
      <td>{{ (b.price/100)|number_format(2, ',') }} €</td>
    </tr>
  {% endfor %}
</table>
{% endif %}
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
      .then(() => db.query('SELECT * FROM books WHERE id=$1 and status>=0', [this._object]))
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.book = res.rows[0]
        }
      })
      .then(() => db.query('SELECT * FROM books WHERE "buyer"=$1 AND id<>$2 AND status=1', [this._user, this._object]))
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.old_books = res.rows
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

module.exports = Template;
