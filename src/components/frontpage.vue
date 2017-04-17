<template>
  <div>
    <div class="maxwidth">
      <h1>{{ msg }}</h1>
      <h2>Täysin uudenlainen palvelu helpottamaan lukiokirjojen ostamista ja myyntiä!</h2>

      <router-link to="/login" class="button btn-l">Kirjaudu sisään!</router-link>

      <h3>Haluaisitko palvelun myös sinun lukioosi?</h3>
      <a @click="yhteys" class="button btn-s">Ota yhteyttä!</a>
    </div>

    <div id="block-steps">
      <div class="maxwidth">
        <h2>Miten KirjatKiertoon.com toimii?</h2>
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
        <div class="number">5</div>
        <div class="text">
          Myyjä saa ilmoituksen varauksesta, ja tuo kirjan koululle koulun ilmoittamana ajankohtana
        </div>
        <span class="divider"></span>
        <div class="text text-right">
          Ostaja saa kirjan koululta maksua vastaan
        </div>
        <div class="number text-right">3</div>
        <span class="divider"></span>
        <div class="number">7</div>
        <div class="text">
          Myyjä on tyytyväinen saatuaan rahat jopa samana päivänä!
        </div>
      </div>
    </div>

    <div class="maxwidth">
      <h2>Yhteystiedot</h2>

      <b>Tuomas Karjalainen</b><br>
      Nurmeksen lukio<br>
      <a href="mailto:tuomas@firmatverkkoon.fi">tuomas@firmatverkkoon.fi</a><br>
      044 324 6320

    </div>

  </div>
</template>

<script>

export default {
  name: 'frontpage',
  data: () => ({
    msg: 'KirjatKiertoon.com'
  }),
  methods: {
    yhteys () {
      console.log('Ota yhteyttä!')
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
</style>
