<template>
<div class="maxwidth">
  <h2>Tilitä myyntituotot myyjälle <small> - Vaihe {{ step+1 }}</small></h2>
  <div class="box" v-if="step == 0">
    <h3>Syötä myyjän nimi, sähköpostiosoite tai tunnuskoodi</h3>
    <input type="text" id="search-input" v-model="search" autocomplete="off" autofocus placeholder="Matti Meikäläinen" />
    <h3>Valitse oikea myyjä</h3>
    <p>"Tilitettävä" sarakkeen tiedot muodossa [toimitettu]/[myyty]/[ilmoitettu]
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Etunimi</th>
            <th>Sukunimi</th>
            <th>Sähköpostiosoite</th>
            <th>Tunnuskoodi</th>
            <th>Tilitettävä</th>
            <th>Luovuttamatta</th>
            <th>Tuomatta</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sellerResults">
            <td>{{ user.firstname }}</td>
            <td>{{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td><passcode :passcode="user.passcode"/></td>
            <td>{{ user.status3 }}</td>
            <td>{{ user.status2 }}</td>
            <td>{{ user.status1 }}</td>
            <td><a href="#" class="button" v-on:click.prevent="selectUser(user)">Valitse</a></td>
          </tr>
          <tr v-if="sellerResults.length == 0 && search.length > 0">
            <td colspan="8" class="center">
              <h3>Haulla ei löydy yhtään myyjää!</h3>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="box" v-if="step == 1">
    <h3>Tilitettävät kirjat</h3>
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in bookResults">
            <td>{{ book.course }}</td>
            <td>{{ book.name }}</td>
            <td v-html="nl2br(book.info)"></td>
            <td class="condition"><i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i></td>
            <td>{{ book.publisher }} {{ book.year }}</td>
            <td class="price-small"><currency :amount="book.price" /></td>
            <td class="price"><currency :amount="book.price - TOTAL_FEE" /></td>
          </tr>
          <tr v-if="bookResults.length == 0">
            <td colspan="7" class="center">
              <h3>Myyjällä ei ole yhtään kirjaa toimittamatta!</h3>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Lisää alennukset</h3>

    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Tyyppi</th>
            <th>Kuvaus</th>
            <th>Määrä</th>
            <th>Poista</th>
          </tr>
        </thead>
        <tbody>
          <tr class="newdiscount">
            <td><select v-model="newline.type">
              <option value="100">Alennus</option>
              <option value="110">Lisämaksu</option>
            </select></td>
            <td><input type="text" v-model="newline.comment" placeholder="" /></td>
            <td><input type="text" v-model="newline.amount" placeholder="" /></td>
            <td>
              <a href="#" class="button btn-s" @click.prevent="addDiscount">Tallenna</a>
            </td>
          </tr>
          <tr v-for="line in discountResults">
            <td>{{ line.type }}</td>
            <td>{{ line.comment }}</td>
            <td><currency :amount="line.amount" /></td>
            <td><a href="#" class="button btn-s" @click.prevent="deleteDiscount(line.id)"</td>
          </tr>
          <tr v-if="discountResults.length == 0">
            <td colspan="8" class="center">
              <h3>Ei alennuksia</h3>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Tilityksen loppusumma</h3>
    <h3 class="price"><currency :amount="payTotal" /></h3>


    <a href="#" class="button" v-on:click.prevent="step = 0">Peruuta</a>
    <a href="#" class="button" v-on:click.prevent="pay()">Tilitä</a>
  </div>


  <div class="box" v-if="step == 2">
    <h2>Tilitys viimeistelty!</h2>
    <h3>Millä tavalla myyjä haluaa kuitin?</h3>
    <div v-if="seller.email" class="receipt-option">
      <p>
        Sähköpostilla, osoitteeseen {{ seller.email }}
      </p>
      <a href="#" class="button" v-on:click.prevent="sendReceipt()">Lähetä</a>
    </div>
    <div v-else class="receipt-option">
      <p>
        Myyjän sähköpostiosoite ei ole tiedossa
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
      <a href="#" class="button" v-on:click.prevent="step = 6">Ohita</a>
    </div>
  </div>
  <div class="box" v-if="step == 3">
    <h2>Kuitti lähetetty</h2>
    <a href="#" class="button" v-on:click.prevent="code = ''; bookResults = []; seller = {}; sellerResults = {}; discountResults = []; search = ''; receipt = null; receiptEmail = ''; step = 0; loadSellers()">Tilitä myyntituotot</a>
    <router-link to="/admin/receive" class="button">Vastaanota kirjoja</router-link>
    <router-link to="/admin/deliver" class="button">Luovuta kirjoja</router-link>
  </div>
</div>
</template>

<script>

import axios from 'axios'
import auth from '../../api/auth'
import Currency from '../currency'
import Passcode from '../passcode'
import { TOTAL_FEE } from '../../Static'

export default {
  components: {
    'currency': Currency,
    'passcode': Passcode
  },
  data () {
    return {
      step: 0,
      search: '',
      sellerResults: [],
      seller: {},
      bookResults: [],
      discountResults: [],
      newline: {
        type: 100,
        amount: '0.50'
      },
      receipt: null,
      receiptEmail: '',
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
    },
    newline: {
      handler: function () {
        console.log('run')
        this.newline.amount = this.newline.amount.replace(',', '.').replace(/[^0-9.]/, '')
      },
      deep: true
    }
  },
  computed: {
    payTotal: function () {
      var total = 0
      for (let i = 0; i < this.bookResults.length; i++) {
        total += this.bookResults[i].price - TOTAL_FEE
      }
      for (let i = 0; i < this.discountResults.length; i++) {
        total -= this.discountResults[i].amount
      }
      return total
    }
  },
  methods: {
    loadSellers: function () {
      if (this.search.length === 0) {
        this.sellerResults = []
        return
      }
      axios.post('/admin/pay/get/sellers', {
        search: this.search,
        token: auth.getToken()
      }).then(response => {
        this.sellerResults = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    selectUser: function (user) {
      this.seller = user
      this.step = 1
      this.loadBooks()
    },
    loadBooks: function () {
      axios.post('/admin/pay/get/books', {
        seller: this.seller.id,
        token: auth.getToken()
      }).then(response => {
        this.bookResults = response.data.data.books
        this.receipt = response.data.data.receipt
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
        } else {
          console.log('Error ' + error.response.status)
        }
      })
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
    addDiscount: function () {
      axios.post('/admin/pay/add/discount', {
        receipt: this.receipt,
        type: this.newline.type,
        comment: this.newline.comment,
        amount: Math.round(this.newline.amount * 100),
        token: auth.getToken()
      }).then(response => {
        this.loadDiscounts()
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    deleteDiscount: function (id) {
      axios.post('/admin/pay/delete/discount', {
        id: id,
        receipt: this.receipt,
        token: auth.getToken()
      }).then(response => {
        this.loadDiscounts()
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    loadDiscounts: function () {
      axios.post('/admin/pay/get/discounts', {
        receipt: this.receipt,
        token: auth.getToken()
      }).then(response => {
        this.discountResults = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    pay: function () {
      axios.post('/admin/pay/set/paid', {
        receipt: this.receipt,
        token: auth.getToken()
      }).then(response => {
        this.step = 2
      }).catch(error => {
        if (error.response.status === 400) {
          console.log(error.response.data.data)
        } else {
          console.log('Error ' + error.response.status)
        }
      })
    },
    sendReceipt: function (email) {
      axios.post('/admin/receipt/email', {
        user: this.seller.id,
        receipt: this.receipt,
        email: email,
        token: auth.getToken()
      }).then(response => {
        this.step = 3
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

tr.newdiscount {
  td {
    border-bottom: 3px solid #aaaaaa !important
    padding: 1em

    input {
      width: 100%
      font-size: 1.3em
      padding: 0.5em
      box-sizing: border-box
    }
  }
}

h3.price {
  font-size: 3em
  margin-top: 0em
}

.receipt-option {
  border: 1px solid #aaaaaa
  padding: 1em
  margin-top: 1em

  a {
    margin: 0
  }
}

</style>
