<template>
  <div class="maxwidth">
    <router-link to="/sell" class="button btn-m" @click="back">Takaisin</router-link>
    <h1>Lisää kirja myyntiin</h1>
    <p>
      Kun joku haluaa ostaa kirjasi, saat ilmoituksen sähköpostiisi.
      Tuo kirja sen jälkeen mahdollisimman pian koululle,
      myynnistä vastaavalle taholle.
    </p>
    <p><b>MUISTA! Vain uuden opetussuunnitelman mukaisten kirjojen myynti sallittu!</b></p>

    <div class="form">
      <h2>1. Valitse oppiaine:</h2>
      <select v-model="subject" @change="changeSubject">
        <option value="" disabled>Valitse</option>
        <optgroup label="Kielet">
          <option value="ÄI">ÄI - Äidinkieli</option>
          <option value="EN">EN - Englanti</option>
          <option value="RU">RU - Ruotsi</option>
        </optgroup>
        <optgroup label="Matematiikka">
          <option value="MAY">MAY - Yhteinen matikka</option>
          <option value="MAA">MAA - Pitkä matikka</option>
          <option value="MAB">MAB - Lyhyt matikka</option>
        </optgroup>
        <optgroup label="Luonnontieteet">
          <option value="BI">BI - Biologia</option>
          <option value="FY">FY - Fysiikka</option>
          <option value="GE">GE - Maantieto</option>
          <option value="KE">KE - Kemia</option>
        </optgroup>
        <optgroup label="Muut reaalit">
          <option value="HI">HI - Historia</option>
          <option value="YH">YH - Yhteiskuntaoppi</option>
          <option value="PS">PS - Psykologia</option>
          <option value="TT">TT - Terveystieto</option>
          <option value="FI">FI - Filosofia</option>
          <option value="UE">UE - Uskonto (ev.lut.)</option>
          <option value="UO">UO - Uskonto (ort.)</option>
          <option value="ET">ET - Elämänkatsomustieto</option>
          <option value="OP">OP - Opinto-ohjaus</option>
        </optgroup>
        <optgroup label="Taito- ja taideaineet">
          <option value="LI">LI - Liikunta</option>
          <option value="MU">MU - Musiikki</option>
          <option value="KU">KU - Kuvataide</option>
        </optgroup>
      </select>

      <h2>2. Valitse kurssi:</h2>
      <select v-model="course" :disabled="subject==''">
        <option value="" disabled>Valitse</option>
        <option :value="subject">Kaikki kurssit (käsikirjat, taulukot ym)</option>
        <option v-for="n in (this.courses[subject])">{{ subject }}{{ n }}</option>
      </select>

      <h2>3. Kirjasarja ja nimi</h2>
      <input v-model="name" :disabled="course==''" placeholder="esim. Särmä - Tehtäviä 3" />

      <h2>4. Muut tiedot</h2>
      <h3>Kunto:</h3>
      <select v-model="condition">
        <option value="0">Ei määritetty</option>
        <option value="1">Surkea</option>
        <option value="2">Välttävä</option>
        <option value="3">Kohtalainen</option>
        <option value="4">Hyvä</option>
        <option value="5">Erinomainen</option>
      </select>

      <h3>Vapaamuotoinen kuvaus:</h3>
      <textarea v-model="info"></textarea>

      <h2>5. Hinta ostajalle</h2>
      <input v-model="price_euros" class="price" type="number" min="5" max="100" required/> euroa
      <input v-model="price_cents" class="price" type="number" min="0" max="90" step="10" required/> senttiä
      <br><b>Anna hinta 10 sentin tarkkuudella. Minimihinta 5€</b>
      <h2>-> Saat kirjasta <currency :amount="profit" /></h2>


      <h2>6. Tarkista tiedot</h2>
      <h3>Ovathan nämä tiedot varmasti oikein?</h3>
      <table>
        <tr>
          <th>Kurssi</th>
          <td>{{ course }}</td>
        </tr>
        <tr>
          <th>Kirjan nimi</th>
          <td>{{ name }}</td>
        </tr>
        <tr>
          <th>Kunto</th>
          <td>
            <span v-if="condition == 0">Ei määritelty</span>
            <span v-if="condition == 1">Surkea</span>
            <span v-if="condition == 2">Välttävä</span>
            <span v-if="condition == 3">Kohtalainen</span>
            <span v-if="condition == 4">Hyvä</span>
            <span v-if="condition == 5">Erinomainen</span>
          </td>
        </tr>
        <tr>
          <th>Kuvaus</th>
          <td v-html="nl2br(info)"></td>
        </tr>
        <tr>
          <th>Hinta</th>
          <td><currency :amount="price_real" /></td>
        </tr>
        <tr>
          <th>Saat rahaa</th>
          <td><currency :amount="profit" /></td>
        </tr>
      </table>

      <hr>
      <div v-if="error == 1" class="error">
        Täytäthän kaikki tiedot!
      </div>
      <div v-if="error == 2" class="error">
        Virheellinen hinta!
      </div>
      <div v-if="error > 200" class="error">
        Palvelinvirhe!
      </div>
      <a href="#" class="button btn-l" @click.prevent="next" :class="{'btn-disabled': error !== 0 && error < 200}">Hyväksy</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { EventBus } from '../EventBus'
import Currency from './currency'
import auth from '../api/auth'
import { COURSES, TOTAL_FEE } from '../Static'

export default {
  name: 'sell-new',
  components: {
    'currency': Currency
  },
  data () {
    return {
      subject: '',
      course: '',
      name: '',
      condition: 0,
      info: '',
      price_euros: '20',
      price_cents: '0',
      courses: COURSES,
      serverError: 0
    }
  },
  methods: {
    changeSubject: function () {
      this.course = ''
    },
    next: function () {
      console.log('next')
      EventBus.$emit('setLoading', true)
      axios.post('/book/add/', {
        token: auth.getToken(),
        course: this.course,
        name: this.name,
        condition: this.condition,
        info: this.info,
        price: this.price_real
      }).then(response => {
        console.log('Success')
        this.serverError = 0
        this.$router.replace({
          name: 'sellSingle',
          params: {
            id: response.data.data.id
          }
        })
      }).catch(error => {
        if (error.response.status === 400) {
          this.serverError = 400
          console.log('Incorrect information')
        } else {
          console.log('Error ' + error.response.status)
          this.serverError = error.response.status
        }
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    back: function () {
      this.$router.go(-1)
    },
    nl2br: function (str) {
      return (str + '')
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;')
         .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2')
    }
  },
  computed: {
    price_real: function () {
      return parseInt(this.price_euros) * 100 + parseInt(this.price_cents)
    },
    profit: function () {
      return this.price_real - TOTAL_FEE
    },
    error: function () {
      if (this.serverError !== 0) {
        return this.serverError
      } else if (this.subject === '' || this.course === '' || this.name === '') {
        return 1
      } else if (
         this.price_euros < 5 ||
         this.price_euros > 100 ||
         this.price_cents < 0 ||
         this.price_cents >= 100 ||
         isNaN(this.price_real) ||
         this.price_euros.indexOf('.') !== -1 ||
         this.price_cents.indexOf('.') !== -1) {
        return 2
      } else {
        return 0
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import '../styles/vars'

h2 {
  margin-top: 1em
  margin-bottom: 0.2em
}
input, select, textarea {
  padding: 0.5em 1em
  display: block
  width: calc(100% - 3em)
}
textarea {
  resize: vertical
}
.price {
  width: initial
  max-width: 60px
  display: inline-block
}
table {
  margin: 1em 0
  border-collapse: collapse
  width: 100%
  td,th {
    border: 1px solid #BBBBBB
    padding: 0.5em 0.7em
  }
  th {
    font-weight: 600
    text-align: left
  }
  td {
    font-size: 1.4em
  }
}
.error {
  border: 2px solid _color-red-500
  border-radius: 4px
  padding: 1em 1em
  margin-top: 1em
  color: _color-red-900
  font-weight: 600
}
</style>
