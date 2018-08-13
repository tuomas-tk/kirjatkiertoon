<template>
<div class="maxwidth">
  <h2>Luovuta kirja ostajalle <small> - Vaihe {{ step+1 }}</small></h2>
  <div class="box box-0" v-if="step == 0">
    <h3>Syötä ostajan nimi tai sähköpostiosoite</h3>
    <input type="text" id="search-input" v-model="search" autocomplete="off" autofocus placeholder="Matti Meikäläinen" />
    <h3>Valitse oikea ostaja</h3>
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Etunimi</th>
            <th>Sukunimi</th>
            <th>Sähköpostiosoite</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in buyerResults">
            <td>{{ user.firstname }}</td>
            <td>{{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td><a href="#" class="button" v-on:click.prevent="selectBuyer(user)">Valitse</a></td>
          </tr>
          <tr v-if="buyerResults.length == 0 && search.length > 0">
            <td colspan="5" class="center">
              <h3>Haulla ei löydy yhtään ostajaa!</h3>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="box box-1" v-if="step == 1">
    <h3>Tarkista henkilöllisyys</h3>
    Henkilöllisyyden vahvistamisksi hyväksytään jokin viranomaisen myöntämä todiste, esimerkiksi <b>kela-kortti, ajokortti, passi tai henkilökortti.</b>
    <h3 class="center">Onhan henkilö varmasti:</h3>
    <h2 class="center">{{ buyer.firstname }} {{ buyer.lastname }} </h2>
    <div class="center">
      <a href="#" class="button" v-on:click.prevent="step = 0; search = ''">Hylkää</a>
      <a href="#" class="button" v-on:click.prevent="step = 2">Hyväksy</a>
    </div>
  </div>
  <div class="box box-2" v-if="step == 2">
    <h2>Saatavilla olevat kirjat:</h2>
    <h3>Etsi säilytyskoodia vastaava kirja, ja laita raksi ruutuun sen kohdalle</h3>
    <div class="table table-books">
      <table>
        <thead>
          <tr>
            <th>Kurssi</th>
            <th>Nimi</th>
            <th>Kuvaus</th>
            <th>Kunto</th>
            <th>Kustantaja ja vuosi</th>
            <th>Hinta</th>
            <th>Säilytyskoodi</th>
            <th>Valitse</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in booksAvailable" :class="{'selected': selectedBooks.indexOf(book.id) != -1}">
            <td>{{ book.course }}</td>
            <td>{{ book.name }}</td>
            <td v-html="nl2br(book.info)"></td>
            <td class="condition"><i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i></td>
            <td>{{ book.publisher }} {{ book.year }}</td>
            <td class="price"><currency :amount="book.price" /></td>
            <td class="code">{{ book.code }}</td>
            <td class="checkbox">
              {{ book.select }}
              <i class="fa fa-check-square-o" v-if="selectedBooks.indexOf(book.id) != -1" v-on:click="selectedBooks.splice(selectedBooks.indexOf(book.id), 1)"></i>
              <i class="fa fa-square-o" v-else v-on:click="selectedBooks.push(book.id)"></i>
            </td>
          </tr>
          <tr v-if="booksAvailable.length == 0">
            <td colspan="8" class="center">
              <h3>Yhtään kirjaa ei ole saatavilla</h3>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="8">Hinta yhteensä: &nbsp;<currency :amount="totalPriceAvailable || 0"/></th>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="info-container" v-if="selectedBooks.length > 0">
      <div class="info">
        <h3>Valittu luovutettavaksi: <span>{{ selectedBooks.length }}/{{ booksAvailable.length }}</span></h3>
        <div class="price"><currency :amount="selectedPrice" /></div>
        <h3>Syötä saamasi rahasumma:</h3>
        <input type="text" v-model="receivedMoney" placeholder="0.00" size="10"> <span class="input-currency">€</span>
        <h3 v-if="giveBack >= 0">Anna vaihtorahaa: <currency :amount="giveBack" /></h3>
        <h3 v-else>Maksettava tilisiirrolla: <currency :amount="-giveBack" /></h3>

        <a href="#" class="button" v-on:click.prevent="deliver()" :class="{'btn-disabled': receivedMoney === ''}">Luovuta kirjat</a>
      </div>
    </div>
    <a href="#" class="button" v-on:click.prevent="step = 0; receivedMoney = ''; selectedBooks = []; search = ''">Peruuta</a>

    <hr>
    <h3>Ostaja on ostanut myös nämä kirjat, mutta niitä ei ole vielä toimitettu koululle</h3>
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Kurssi</th>
            <th>Nimi</th>
            <th>Kuvaus</th>
            <th>Kunto</th>
            <th>Kustantaja ja vuosi</th>
            <th>Hinta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in booksComing">
            <td>{{ book.course }}</td>
            <td>{{ book.name }}</td>
            <td v-html="nl2br(book.info)"></td>
            <td class="condition"><i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i></td>
            <td>{{ book.publisher }} {{ book.year }}</td>
            <td class="price"><currency :amount="book.price" /></td>
          </tr>
          <tr v-if="booksComing.length == 0">
            <td colspan="6" class="center">
              <h3>Ei muita kirjoja ostettu</h3>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="6">Hinta yhteensä: &nbsp;<currency :amount="totalPriceComing || 0"/></th>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
  <div class="box box-3" v-if="step == 3">
    <h3>Millä tavalla ostaja haluaa kuitin?</h3>
    <div v-if="buyer.email" class="receipt-option">
      <p>
        Sähköpostilla, osoitteeseen {{ buyer.email }}
      </p>
      <a href="#" class="button" v-on:click.prevent="sendReceipt()">Lähetä</a>
    </div>
    <div v-else class="receipt-option">
      <p>
        Ostajan sähköpostiosoite ei ole tiedossa
      </p>
    </div>
    <div class="receipt-option">
      <p>
        Sähköpostilla, osoitteeseen:
        <input type="email" v-model="receiptEmail" placeholder="matti.meikalainen@example.fi" size="30" />
      </p>
      <p>
        (Syöttämäsi osoite merkitään myyjän tietohin)
      </p>
      <a href="#" class="button" v-on:click.prevent="sendReceipt(receiptEmail)">Lähetä</a>
    </div>
    <div class="receipt-option">
      <p>
        Tulostettuna
      </p>
      <a href="#" class="button" v-on:click.prevent="openReceipt()">Tulosta kuitti</a>
    </div>
    <div class="receipt-option">
      <p>
        Ohita kuitin lähetys
      </p>
      <a href="#" class="button" v-on:click.prevent="step = 4">Ohita</a>
    </div>
  </div>
  <div class="box" v-if="step == 4">
    <h2>Kuitti lähetetty</h2>
    <router-link to="/admin/receive" class="button">Vastaanota kirjoja</router-link>
    <a href="#" class="button" v-on:click.prevent="step = 0; search = ''; buyerResults = []; buyer = {}; booksAvailable = []; booksComing = []; selectedBooks = []; receivedMoney = ''">Luovuta kirjoja</a>
  </div>
</div>
</template>

<script>

import axios from 'axios'
import auth from '../../api/auth'
import Currency from '../currency'

export default {
  components: {
    'currency': Currency
  },
  data () {
    return {
      step: 0,
      search: '',
      buyerResults: [],
      buyer: {},
      booksAvailable: [],
      booksComing: [],
      selectedBooks: [],
      receivedMoney: '',
      receipt: null,
      receiptEmail: ''
    }
  },
  created () {
    console.log('created')
    this.loadBuyers()
  },
  watch: {
    search: function () {
      this.loadBuyers()
    },
    buyer: function () {
      this.loadBooks()
    },
    receivedMoney: function () {
      this.receivedMoney = this.receivedMoney.replace(',', '.').replace(/[^0-9.]/, '')
    }
  },
  computed: {
    totalPriceAvailable: function () {
      var sum = 0
      for (var i = 0; i < this.booksAvailable.length; i++) {
        sum += this.booksAvailable[i].price
      }
      return sum
    },
    totalPriceComing: function () {
      var sum = 0
      for (var i = 0; i < this.booksComing.length; i++) {
        sum += this.booksComing[i].price
      }
      return sum
    },
    selectedPrice: function () {
      var sum = 0
      for (var i = 0; i < this.booksAvailable.length; i++) {
        if (this.selectedBooks.indexOf(this.booksAvailable[i].id) !== -1) {
          sum += this.booksAvailable[i].price
        }
      }
      return sum
    },
    giveBack: function () {
      return this.receivedMoney * 100 - this.selectedPrice
    }
  },
  methods: {
    loadBuyers: function () {
      if (this.search.length === 0) {
        this.buyerResults = []
        return
      }
      axios.post('/admin/deliver/get/buyers', {
        search: this.search,
        token: auth.getToken()
      }).then(response => {
        this.buyerResults = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    selectBuyer: function (user) {
      console.log(user)
      this.buyer = user
      this.step = 1
    },
    loadBooks: function () {
      axios.post('/admin/deliver/get/books', {
        buyer: this.buyer.id,
        token: auth.getToken()
      }).then(response => {
        this.booksAvailable = response.data.data.available
        this.booksComing = response.data.data.coming
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
    deliver: function () {
      if (this.receivedMoney === '') return
      axios.post('/admin/deliver/set/delivered', {
        books: this.selectedBooks,
        buyer: this.buyer.id,
        receivedMoney: this.receivedMoney * 100,
        bankMoney: this.selectedPrice - this.receivedMoney * 100,
        token: auth.getToken()
      }).then(response => {
        this.step = 3
        this.receipt = response.data.data.receipt
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    sendReceipt: function (email) {
      axios.post('/admin/receipt/email', {
        user: this.buyer.id,
        receipt: this.receipt,
        email: email,
        token: auth.getToken()
      }).then(response => {
        this.step = 4
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
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


.center {
  text-align: center
}

.table > table {
  padding: 0
}

.box-0 {
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
}

.box-1 {
  h3.center {
    margin-top: 3em
  }
}

.box-2 {
  .table-books {
    tr.selected {
      background-color: #dcffd3
    }
    td.code {
      text-align: center
      font-size: 2em
      font-weight: 600
    }

    td.checkbox {
      font-size: 2em
      padding: 0
      text-align: center
      cursor: pointer
    }
  }
  .info-container {
    text-align: right
    .info {
      display: inline-block
      border: 1px solid #aaaaaa
      padding: 1em
      border-radius: 5px

      h3 > span {
        padding-left: .2em
        font-size: 1.4em
      }

      .price {
        margin-top: .5em
        margin-bottom: .6em
        font-size: 2.5em
        font-weight: 600
      }

      input {
        font-size: 1.2em
        text-align: right
      }
      .input-currency {
        font-size: 1.2em
        font-weight: 600
      }

      .button {
        display: block
        text-align: center
      }
    }
  }
}

.box-3 {
  .receipt-option {
    border: 1px solid #aaaaaa
    padding: 1em
    margin-top: 1em

    a {
      margin: 0
    }
  }
}
</style>
