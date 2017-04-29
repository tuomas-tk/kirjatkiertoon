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

      <div class="dashboard" v-if="authStatus > 0">
        <div class="section">
          <h2>Osto</h2>
          <h3>Noudettavana</h3>
          <div class="number">0<span>kirjaa</span></div>
          <h3>Tulossa koululle</h3>
          <div class="number">0<span>kirjaa</span></div>
          <router-link to="/buy" class="button btn-m btn-block">Etsi kirjoja</router-link>
          <router-link to="/buy/bought" class="button btn-m btn-block">Näytä ostetut kirjat</router-link>
        </div><div class="section" v-if="authStatus >= 2">
          <h2>Myynti</h2>
          <h3>Kirjoja toimittamatta koululle</h3>
          <div class="number">0<span>kirjaa</span></div>
          <h3>Myynnissä</h3>
          <div class="number">0<span>kirjaa</span></div>
          <router-link to="/sell" class="button btn-m btn-block">Myytävät kirjat</router-link>
          <router-link to="/sell" class="button btn-m btn-block">Myy uusi kirja</router-link>
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

export default {
  name: 'frontpage',
  methods: {
    yhteys () {
      console.log('Ota yhteyttä!')
      console.log(document.getElementById('yhteys').offsetTop)
      scroll(0, document.getElementById('yhteys').offsetTop)
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
    }
  }
}
</style>
