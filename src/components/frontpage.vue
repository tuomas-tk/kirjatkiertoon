<template>
  <div>
    <div v-if="authStatus == 0" class="maxwidth">
      <div class="column-50">
        <h1>KirjatKiertoon.fi</h1>
        <h2>Täysin uusi kirjamyyntialusta lukioiden käyttöön!</h2>
      </div><div class="column-50">
        <login @login="load" />
      </div>

      <h3>Haluaisitko palvelun käyttöön myös sinun lukioosi?</h3>
      <a @click="yhteys" class="button btn-s">Ota yhteyttä!</a>
    </div>
    <div v-else class="maxwidth">

      <h1>Tervetuloa!</h1>

      <div class="add-email box" v-if="!auth.email && auth.status >= 2">
        <h2>Lisää sähköpostiosoite heti!</h2>
        <p>
          <b>Saat sähköpostilla tiedon kun...</b>
          <ul>
            <li>ostamasi kirja on noudettavissa</li>
            <li>myymäsi kirja on ostettu, ja pitää toimittaa koululle</li>
          </ul>
        </p>
        <form @submit.prevent="save_email">
          <input type="email" placeholder="Sähköpostiosoite" v-model="add_email" class="text-input" />
          <input type="submit" class="button btn-s" value="Tallenna" />
        </form>
        <small>
          Emme <u>koskaan</u> lähetä turhia viestejä, tai luovuta sähköpostiosoitettasi ulkopuolisille!
        </small>
      </div>

      <div class="dashboard" v-if="authStatus == 1">
        <div class="section">
          <h2>Osta kirjoja</h2>
          <h3>Palvelussa myynnissä tällä hetkellä</h3>
          <div class="number">
            {{ dashboard.available }}<span>kirjaa</span>
          </div>
          <router-link to="/buy" class="button btn-m btn-block"><i class="fa fa-search fa-fw"></i> Etsi kirjoja</router-link>
        </div>
      </div>

      <div class="dashboard" v-if="authStatus >= 2 && authStatus < 10">
        <div class="section">
          <h2>Osto</h2>
          <h3>Nouda koululta</h3>
          <div class="number" :class="{'number-red': dashboard.buy_ready > 0}">
            {{ dashboard.buy_ready }}<span>kirjaa</span>
          </div>
          <h3>Tulossa koululle</h3>
          <div class="number">
            {{ dashboard.buy_bought }}<span>kirjaa</span>
          </div>
          <router-link to="/buy" class="button btn-m btn-block"><i class="fa fa-search fa-fw"></i> Etsi kirjoja</router-link>
          <router-link to="/buy/bought" class="button btn-m btn-block"><i class="fa fa-check fa-fw"></i> Näytä ostamasi kirjat</router-link>
        </div><div class="section" v-if="authStatus >= 5">
          <h2>Myynti</h2>
          <h3>Toimita koululle</h3>
          <div class="number" :class="{'number-red': dashboard.sell_sold > 0}">
            {{ dashboard.sell_sold }}<span>kirjaa</span>
          </div>
          <h3>Kirjoja myymättä (vielä)</h3>
          <div class="number">
            {{ dashboard.sell_available }}<span>kirjaa</span>
          </div>
          <router-link to="/sell/new" class="button btn-m btn-block"><i class="fa fa-pencil fa-fw"></i> Myy uusi kirja</router-link>
          <router-link to="/sell" class="button btn-m btn-block"><i class="fa fa-list fa-fw"></i> Myymäsi kirjat</router-link>
        </div>
      </div>

      <div class="dashboard" v-if="authStatus >= 10">
        <div class="section-22">
          <h3>Myytävänä</h3>
          <div class="number">
            {{ dashboard.count0 }}<span>kirjaa</span>
          </div>
          <div class="price">
            Hinta yhteensä: <currency :amount="dashboard.price0" />
          </div>
          <router-link to="/admin/books?status=0" class="button btn-m btn-block"><i class="fa fa-bars fa-fw"></i> Näytä</router-link>
        </div><div class="section-28">
          <h3>Toimitettava koululle</h3>
          <div class="number">
            {{ dashboard.count1 }}<span>kirjaa</span>
          </div>
          <div class="price">
            Hinta yhteensä: <currency :amount="dashboard.price1" />
          </div>
          <router-link to="/admin/books?status=1" class="button btn-m btn-block"><i class="fa fa-bars fa-fw"></i> Näytä</router-link>
          <router-link to="/admin/receive" class="button btn-m btn-block"><i class="fa fa-sign-in fa-fw"></i> Vastaanota myyjältä</router-link>
        </div><div class="section-28">
          <h3>Noudettava koululta</h3>
          <div class="number">
            {{ dashboard.count2 }}<span>kirjaa</span>
          </div>
          <div class="price">
            Hinta yhteensä: <currency :amount="dashboard.price2" />
          </div>
          <router-link to="/admin/books?status=2" class="button btn-m btn-block"><i class="fa fa-bars fa-fw"></i> Näytä</router-link>
          <router-link to="/admin/deliver" class="button btn-m btn-block"><i class="fa fa-sign-out fa-fw"></i> Luovuta ostajalle</router-link>
        </div><div class="section-22">
          <h3>Luovutettu ostajille</h3>
          <div class="number">
            {{ dashboard.count3 }}<span>kirjaa</span>
          </div>
          <div class="price">
            Hinta yhteensä: <currency :amount="dashboard.price3" />
          </div>
          <router-link to="/admin/books?status=3" class="button btn-m btn-block"><i class="fa fa-bars fa-fw"></i> Näytä</router-link>
        </div>
        <div class="section-22">
          <h3>Myyntituottojen tilitys myyjille</h3>
          <b>Valmiina tilitettäväksi:</b>
          <div class="number">
            {{ dashboard.usercount3 }}<span>myyjää</span>
          </div>
          <router-link to="/admin/pay" class="button btn-m btn-block"><i class="fa fa-sign-out fa-fw"></i> Tilitä tuottoja</router-link>
          </table>
        </div>
        <div class="section-22">
          <h3>Tilitetty</h3>
          <div class="number">
            {{ dashboard.count4 }}<span>kirjaa</span>
          </div>
          <router-link to="/admin/books?status=4" class="button btn-m btn-block"><i class="fa fa-bars fa-fw"></i> Näytä</router-link>
          </table>
        </div>
      </div>
    </div>

    <div id="block-steps" v-if="authStatus < 10">
      <div class="maxwidth">
        <h2>Miten KirjatKiertoon.fi toimii?</h2>
        <div class="caption">MYYJÄ</div>
        <div class="caption-right">OSTAJA</div>

        <span class="divider"></span>

        <div class="number">1</div>
        <div class="text">
          Kirjan myyjä kirjautuu palveluun koululta saamillaan tunnuksilla
        </div>

        <span class="divider"></span>

        <div class="number">2</div>
        <div class="text">
          Myyjä syöttää kirjan tiedot palveluun, ja valitsee itse hinnan
        </div>

        <span class="divider"></span>

        <div class="text text-right">
          Ostaja kirjautuu palveluun koululta saamillaan tunnuksilla
        </div>
        <div class="number text-right">1</div>

        <span class="divider"></span>

        <div class="text text-right">
          Ostaja etsii ja ostaa tarvitsemansa kirjat palvelusta
        </div>
        <div class="number text-right">2</div>

        <span class="divider"></span>

        <div class="number">3</div>
        <div class="text">
          Myyjä saa ilmoituksen ja tuo kirjan koululle mahdollisimman pian
        </div>

        <span class="divider"></span>

        <div class="text text-right">
          Ostaja saa kirjan koululta maksua vastaan
        </div>
        <div class="number text-right">3</div>

        <span class="divider"></span>

        <div class="number">4</div>
        <div class="text">
          Myyjä on tyytyväinen saatuaan rahat jopa samana päivänä!
        </div>
      </div>
    </div>

    <div class="maxwidth" v-if="authStatus < 10">
      <h2 id="yhteys">Pyydä lisätietoja!</h2>

      <b>Tuomas Karjalainen</b><br>
      Nurmeksen lukio<br>
      <i class="fa fa-envelope fa-fw"></i> <a href="mailto:tuomas@firmatverkkoon.fi">tuomas@firmatverkkoon.fi</a><br>
      <i class="fa fa-phone fa-fw"></i> 044 324 6320 (myös <i class="fa fa-whatsapp"></i> WhatsApp!)
      <br><br>
    </div>
  </div>
</template>

<script>
import auth from '../api/auth'
import axios from 'axios'
import {EventBus} from '../EventBus'
import login from './login'
import currency from './currency'

export default {
  name: 'frontpage',
  components: {
    'login': login,
    'currency': currency
  },
  data () {
    return {
      dashboard: {},
      auth: auth,
      add_email: ''
    }
  },
  created () {
    this.load()
  },
  methods: {
    yhteys () {
      console.log('Ota yhteyttä!')
      console.log(document.getElementById('yhteys').offsetTop)
      scroll(0, document.getElementById('yhteys').offsetTop)
    },
    load: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/user/get/dashboard', {
        token: auth.getToken()
      }).then(response => {
        this.dashboard = response.data.data
      }).catch(error => {
        console.log('Error ' + error.response.status)
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    save_email () {
      EventBus.$emit('setLoading', true)
      axios.post('/user/edit/profile', {
        email: this.add_email,
        token: auth.getToken()
      }).then(response => {
        auth.checkAuth().then(response => {
          this.auth = auth
          console.log(!auth.email)
        })
      }).catch(error => {
        console.log('Error ' + error.response.status)
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    }
  },
  computed: {
    authStatus: function () {
      return auth.status
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import '../styles/vars'
@import '../styles/box'

@media (min-width: 800px) {
  .column-50 {
    display: inline-block
    width: 50%
    vertical-align: top
  }
}

#block-steps {
  background-color: #444444
  color: #FFFFFF

  .maxwidth {
    padding-top: 1.5em
    padding-bottom: 1.5em
  }

  .caption, .caption-right {
    font-family: Neucha
    font-size: 2em
    color: #F0F0F0
    padding-top: 0.5em
    padding-bottom: 0.5em
  }
  .caption {
    float: left
  }
  .caption-right {
    float: right
  }

  .number {
    display: inline-block
    vertical-align: middle
    font-size: 5em
    font-family: Neucha
    line-height: 1.5em
    width: 1em
  }
  .text {
    display: inline-block
    vertical-align: middle
    width: calc(100% - 5.5em)
    font-size: 1.2em
    line-height: 1.5em

    a {
      color: #FFFFFF
    }
  }

  .text-right {
    text-align: right
  }

  .divider {
    display: block;
    border-bottom: 1px solid #555555
    clear: both
  }
}

.add-email {
  .text-input {
    padding: 1em 0.5em
  }
}

.dashboard {
  .section {
    @extend .box

    padding: 0em 2em
    margin: 1em 1em
    overflow: hidden

    @media (min-width: 700px) {
      display: inline-block
      vertical-align: top
      width: calc(50% - 6em)
    }

    .button {
      margin-top: 1em
      text-align: center
    }

    .number {
      font-size: 5em
      font-weight: 600
      margin-bottom: .3em

      span {
        font-size: .3em
        color: #555555
        padding-left: 0.2em

      }

      &.number-red {
        color: _color-red-500

        span {
          color: _color-red-900
        }
      }
    }
    .price {
      text-align: center
      font-size: 1em
      font-weight: 600
      margin-bottom: .5em

      span {
        padding-left: .2em
        font-size: 1.5em
      }
    }
  }
  .section-22, .section-28 {
    @extends .dashboard .section
    h3 {
      margin-top: 1.5em
    }
  }
  @media (min-width: 700px) {
    .section-22 {
      width: calc(22% - 6em)
    }
    .section-28 {
      width: calc(28% - 6em)
    }
  }
  .section-100 {
    @extends .dashboard .section
    width: 100%
  }
}
</style>
