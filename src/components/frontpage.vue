<template>
  <div>
    <div v-if="authStatus == 0" class="maxwidth">
      <h1>KirjatKiertoon.fi</h1>
      <h2>Täysin uusi kirjamyyntialusta lukioiden käyttöön!</h2>
      <router-link to="/login" class="button btn-l">Kirjaudu sisään!</router-link>

      <h3>Haluaisitko palvelun myös sinun lukioosi?</h3>
      <a @click="yhteys" class="button btn-s">Ota yhteyttä!</a>
    </div>
    <div v-else class="maxwidth">

      <h1>Tervetuloa!</h1>
      <router-link v-if="authStatus == 42" to="/super" class="button btn-l">SuperConsole</router-link>

      <div class="dashboard" v-if="authStatus > 0 && authStatus < 10">
        <div class="section">
          <h2>Osto</h2>
          <h3>Noudettavana</h3>
          <div class="number" :class="{'number-red': dashboard.buy_ready > 0}">
            {{ dashboard.buy_ready }}<span>kirjaa</span>
          </div>
          <h3>Tulossa koululle</h3>
          <div class="number">
            {{ dashboard.buy_bought }}<span>kirjaa</span>
          </div>
          <router-link to="/buy" class="button btn-m btn-block">Etsi kirjoja</router-link>
          <router-link to="/buy/bought" class="button btn-m btn-block">Näytä ostetut kirjat</router-link>
        </div><div class="section" v-if="authStatus >= 2">
          <h2>Myynti</h2>
          <h3>Kirjoja toimittamatta koululle</h3>
          <div class="number" :class="{'number-red': dashboard.sell_sold > 0}">
            {{ dashboard.sell_sold }}<span>kirjaa</span>
          </div>
          <h3>Myynnissä</h3>
          <div class="number">
            {{ dashboard.sell_available }}<span>kirjaa</span>
          </div>
          <router-link to="/sell" class="button btn-m btn-block">Myytävät kirjat</router-link>
          <router-link to="/sell" class="button btn-m btn-block">Myy uusi kirja</router-link>
        </div>
      </div>

      <div class="dashboard" v-if="authStatus >= 10">
        <div class="section">
          <h2>Koululla</h2>
          <h3>Noutamista odottaa</h3>
          <div class="number">
            {{ dashboard.status2 }}<span>kirjaa</span>
          </div>
          <h3>Koululta myyty yhteensä</h3>
          <div class="number">
            {{ dashboard.status3 }}<span>kirjaa</span>
          </div>
        </div><div class="section" v-if="authStatus >= 2">
          <h2>Myyjillä</h2>
          <h3>Kirjoja toimittamatta koululle</h3>
          <div class="number" :class="{'number-red': dashboard.sell_sold > 0}">
            {{ dashboard.status1 }}<span>kirjaa</span>
          </div>
          <h3>Myynnissä yhteensä</h3>
          <div class="number">
            {{ dashboard.status0 }}<span>kirjaa</span>
          </div>
        </div>
      </div>
    </div>

    <div id="block-steps">
      <div class="maxwidth">
        <h2>Miten KirjatKiertoon.fi toimii?</h2>
        <div class="caption">MYYJÄ</div>
        <div class="caption-right">OSTAJA</div>

        <span class="divider"></span>

        <div class="number">1</div>
        <div class="text">
          Kirjan myyjä <router-link to="/login">kirjautuu</router-link> palveluun koululta saamillaan tunnuksilla
        </div>

        <span class="divider"></span>

        <div class="number">2</div>
        <div class="text">
          Hän valitsee omistamansa kirjan listasta, ja valitsee kirjalleen hinnan
        </div>

        <span class="divider"></span>

        <div class="text text-right">
          Ostaja <router-link to="/login">kirjautuu</router-link> palveluun koululta saamillaan tunnuksilla
        </div>
        <div class="number text-right">1</div>

        <span class="divider"></span>

        <div class="text text-right">
          Hän selaa saatavilla olevia kirjoja, ja valitsee haluamansa kirjat
        </div>
        <div class="number text-right">2</div>

        <span class="divider"></span>

        <div class="number">3</div>
        <div class="text">
          Myyjä saa ilmoituksen varauksesta, ja tuo kirjan koululle koulun ilmoittamana ajankohtana
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

    <div class="maxwidth">
      <h2 id="yhteys">Pyydä lisätietoja!</h2>

      <b>Tuomas Karjalainen</b><br>
      Nurmeksen lukio<br>
      <a href="mailto:tuomas@firmatverkkoon.fi">tuomas@firmatverkkoon.fi</a><br>
      044 324 6320
      <br><br>
    </div>
  </div>
</template>

<script>
import auth from '../api/auth'
import axios from 'axios'
import {EventBus} from '../EventBus'

export default {
  name: 'frontpage',
  data () {
    return {
      dashboard: {}
    }
  },
  created () {
    // console.log(this.$route.params.id)
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
      axios.post((auth.status < 10) ? '/user/get/dashboard' : '/user/get/school/stats', {
        token: auth.getToken()
      }).then(response => {
        this.dashboard = response.data.data
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


.dashboard {
  .section {
    background-color: #FFFFFF
    padding: 0em 2em
    margin: 1em 1em
    overflow: hidden
    border-radius: 5px
    box-shadow: 0 3px 10px rgba(0,0,0,0.1)

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
      margin-bottom: .5em

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
  }
}
</style>
