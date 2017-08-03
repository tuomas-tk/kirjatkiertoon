<template>
<div class="maxwidth">
  <h2>Vastaanota kirja myyjältä <small> - Vaihe {{ step+1 }}</small></h2>
  <div class="box" v-if="step == 0">
    <h3>Syötä myyjän nimi, sähköpostiosoite tai tunnuskoodi</h3>
    <input type="text" id="search-input" v-model="search" autocomplete="off" autofocus placeholder="Matti Meikäläinen" />
    <h3>Valitse oikea myyjä</h3>
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Etunimi</th>
            <th>Sukunimi</th>
            <th>Sähköpostiosoite</th>
            <th>Tunnuskoodi</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sellerResults">
            <td>{{ user.firstname }}</td>
            <td>{{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.passcode }}</td>
            <td><a href="#" class="button" v-on:click.prevent="selectUser(user)">Valitse</a></td>
          </tr>
          <tr v-if="sellerResults.length == 0">
            <td colspan="5" class="center">
              <h3>Koulullasi ei ole yhtään myyjää!</h3>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="box" v-if="step == 1">
    <h3>Tarkista henkilöllisyys</h3>
    Henkilöllisyyden vahvistamisksi hyväksytään jokin viranomaisen myöntämä todiste, esimerkiksi <b>kela-kortti, ajokortti, passi tai henkilökortti.</b>
    <h3 class="center">Onhan henkilö varmasti:</h3>
    <h2 class="center">{{ seller.firstname }} {{ seller.lastname }} </h2>
    <div class="center">
      <a href="#" class="button" v-on:click.prevent="step = 0; search = ''">Hylkää</a>
      <a href="#" class="button" v-on:click.prevent="step = 2">Hyväksy</a>
    </div>
  </div>
  <div class="box" v-if="step == 2">
    <h3>Valitse oikea kirja</h3>
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Kurssi</th>
            <th>Nimi</th>
            <th>Kuvaus</th>
            <th>Kunto</th>
            <th>Kustantaja ja vuosi</th>
            <th>Hinta ostajalle</th>
            <th>Myyjä saa rahaa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in bookResults">
            <td>{{ book.course }}</td>
            <td>{{ book.name }}</td>
            <td>{{ book.info }}</td>
            <td class="condition"><i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i></td>
            <td>{{ book.publisher }} {{ book.year }}</td>
            <td><currency :amount="book.price" /></td>
            <td><currency :amount="book.price - TOTAL_FEE" /></td>
            <td><a href="#" class="button" v-on:click.prevent="selectBook(book)">Valitse</a></td>
          </tr>
          <tr v-if="bookResults.length == 0">
            <td colspan="8" class="center">
              <h3>Myyjällä ei ole yhtään kirjaa toimittamatta!</h3>
            </td>
          </tr>
        </tbody>
      </table>
      <a href="#" class="button" v-on:click.prevent="step = 0">Peruuta</a>
    </div>
  </div>
  <div class="box" v-if="step == 3">
    <h3>Tarkista kirja</h3>
    Tarkista että kirja on sellainen kuin sanotaan. Muista tarkistaa myös painovuosi!
    <table class="info">
      <tr>
        <th>Kirjan nimi</th>
        <td>{{ book.name }}</td>
      </tr>
      <tr>
        <th>Kurssi</th>
        <td>{{ book.course }}</td>
      </tr>
      <tr>
        <th>Kuvaus</th>
        <td v-html="nl2br(book.info)"></td>
      </tr>
      <tr>
        <th>Kunto</th>
        <td class="condition"><i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i></td>
      </tr>
      <tr>
        <th>Kustantaja</th>
        <td>{{ book.publisher }}</td>
      </tr>
      <tr>
        <th>Painovuosi</th>
        <td>{{ book.year }}</td>
      </tr>
      <tr>
        <th>Hinta</th>
        <td><currency :amount="book.price" /></td>
      </tr>
      <tr>
        <th>Myyjä saa rahaa</th>
        <td><currency :amount="book.price - TOTAL_FEE"/></td>
      </tr>
    </table>
    <div class="center">
      <a href="#" class="button" v-on:click.prevent="step = 2; book = {}">Hylkää</a>
      <a href="#" class="button" v-on:click.prevent="step = 4; loadCode()">Hyväksy</a>
    </div>
  </div>
  <div class="box center" v-if="step == 4">
    <h3>Merkitse kirjaan säilytyskoodi</h3>
    Suosittelemme esimerkiksi maalarinteippiä
    <h3 class="code">{{ code }}</h3>
    <h3>Varmista että koodi on oikein, selkeä, ja tiukasti kiinni</h3>
    <a href="#" class="button" v-on:click.prevent="step = 3; code = ''">Hylkää</a>
    <a href="#" class="button" v-on:click.prevent="accept()">Hyväksy</a>
  </div>
  <div class="box center" v-if="step == 5">
    <h2>Kirjan {{ code }} vastaanotto onnistui!</h2>
    <div v-if="seller.email">
      <h3>Myyjä saa tositteen sähköpostilla, osoitteeseen {{ seller.email }}</h3>
    </div>
    <div v-else>
      <h3>Myyjä ei ole antanut sähköpostiosoitettaan, eli tositteen lähettäminen ei onnistu</h3>
    </div>
    <br><br>
    <h3>Vastaanota toinen kirja</h3>
    <a href="#" class="button" v-on:click.prevent="code = ''; bookResults = [];  step = 2; loadBooks();">Sama myyjä</a>
    <a href="#" class="button" v-on:click.prevent="code = ''; bookResults = []; seller = {}; sellerResults = {}; search = ''; step = 0; loadSellers()">Eri myyjä</a>
  </div>
</div>
</template>

<script>

import axios from 'axios'
import auth from '../../api/auth'
import Currency from '../currency'
import { TOTAL_FEE } from '../../Static'

export default {
  components: {
    'currency': Currency
  },
  data () {
    return {
      step: 0,
      search: '',
      sellerResults: [],
      seller: {},
      bookResults: [],
      code: '',
      TOTAL_FEE: TOTAL_FEE
    }
  },
  created () {
    console.log('created')
    this.loadSellers()
  },
  watch: {
    search: function () {
      this.loadSellers()
    },
    seller: function () {
      this.loadBooks()
    }
  },
  methods: {
    loadSellers: function () {
      axios.post('/admin/receive/get/sellers', {
        search: this.search,
        token: auth.getToken()
      }).then(response => {
        this.sellerResults = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    selectUser: function (user) {
      console.log(user)
      this.seller = user
      this.step = 1
    },
    loadBooks: function () {
      axios.post('/admin/receive/get/books', {
        seller: this.seller.id,
        token: auth.getToken()
      }).then(response => {
        this.bookResults = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    selectBook: function (book) {
      this.book = book
      this.step = 3
    },
    nl2br: function (str) {
      return (str + '')
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;')
         .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2')
    },
    loadCode: function () {
      axios.post('/admin/receive/get/code', {
        book: this.book.id,
        token: auth.getToken()
      }).then(response => {
        this.code = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    accept: function () {
      axios.post('/admin/receive/set/received', {
        book: this.book.id,
        code: this.code,
        token: auth.getToken()
      }).then(response => {
        console.log('ok')
        this.step = 5
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../styles/vars'
@import '../../styles/box'
@import '../../styles/tables'

#search-input {
  display: block
  font-size: 1.2em
  padding: .5em .5em
  width: calc(100% - 1.8em)
}

table {
  a.button {
    margin: .2em 0
    display: block
    text-align: center
  }
}

.center {
  text-align: center
}

h3.center {
  margin-top: 3em
}

table.info {
  margin: 1em 0
  border-collapse: collapse
  width: 100%
  td,th {
    border: 1px solid #BBBBBB
    padding: 0.5em 0.7em

    &.condition {
      white-space: nowrap
      color: #444444
      font-weight: 700
      font-size: 1.5em

      i.fa-star {
        color: _color-amber-700
      }
      i.fa-star-o {
        color: #BBBBBB
      }
    }
  }
  th {
    font-weight: 600
    text-align: left
  }
  td {
    font-size: 1.4em
  }
}

h3.code {
  font-size: 4em
  margin-top: 1em
}

</style>
