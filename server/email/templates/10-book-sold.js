const BaseTemplate = require('./Template')
const db = require('./../../db')

class Template extends BaseTemplate {
  constructor(action) {
    super(action)
    this._subject = 'Kirjasi on myyty, toimita koululle!';
    this._textTemplate = `
Hei {{ user.firstname }}!
-  -  -  -  -  -  -  -  -

Hyviä uutisia! KirjatKiertoon.fi palveluun ilmoittamasi kirja HALUTAAN OSTAA!
KURSSI: {{ book.course }}
NIMI:   {{ book.name }}
HINTA:  {{ (book.price / 100)|number_format(2, ',') }} €
SELITE: {{ book.info }}

Toimita kirja koululle MAHDOLLISIMMAN PIAN!

{% if old_books %}
Muistathan myös nämä, jo aiemmin myydyt kirjasi, jotka pitää myös toimittaa koululle:
{% for b in old_books %}
 - {{ b.course }} - {{ b.name }} - {{ (b.price/100)|number_format(2, ',') }} €
{% endfor %}
{% endif %}

Kiitos että olet käyttänyt KirjatKiertoon.fi -palvelua!
Voit lähettää palautetta ja kehitysehdotuksia vastaamalla tähän viestiin.

Terveisin,
Tuomas Karjalainen
tuomas@firmatverkkoon.fi
KirjatKiertoon.fi  /  FirmatVerkkoon.fi
`
    this._htmlTemplate = `
<h1>Hei {{ user.firstname }}!</h1>
<h2>Hyviä uutisia! <a href="https://kirjatkiertoon.fi">KirjatKiertoon.fi</a> palveluun ilmoittamasi kirja halutaan ostaa!</h2>
<table>
  <tr>
    <th>KURSSI</td>
    <th>NIMI</td>
    <th>HINTA</td>
    <th>SELITE</td>
  </tr>
  <tr>
    <td>{{ book.course }}</td>
    <td>{{ book.name }}</td>
    <td>{{ (book.price/100)|number_format(2, ',') }} €</td>
    <td>{{ book.info }}</td>
  </tr>
</table>
<p>
<b>Toimita kirja koululle mahdollisimman pian!</b><br>
</p>
{% if old_books %}
<hr />
<h2>Muistathan myös nämä, jo myydyt kirjasi, jotka pitää myös toimittaa koululle:</h2>
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
      .then(() => db.query('SELECT * FROM books WHERE id=$1 AND status>=0', [this._object]))
      .then(res => {
        if (res != null && res.rowCount > 0) {
          this._data.book = res.rows[0]
        }
      })
      .then(() => db.query('SELECT * FROM books WHERE "user"=$1 AND id<>$2 AND status=1', [this._user, this._object]))
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
