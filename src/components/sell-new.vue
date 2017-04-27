<template>
  <div class="maxwidth">
    <h1>Lisää kirja myyntiin</h1>
    <p>Tähän pieni selostus</p>
    <p><b>HUOMIO! Vain uuden opetussuunnitelman mukaisten kirjojen myynti sallittu!</b></p>

    <div class="form">
      <form>

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
          <option value="">Kaikki</option>
          <option v-for="n in (this.courseCount[subject])">{{ subject }}{{ n }}</option>
        </select>

        <h2>3. Kirjasarja ja nimi</h2>
        <h3>Kirjasarja:</h3>
        <input v-model="series" :disabled="course==''" placeholder="esim. FORUM 3" />
        <h3>Kirjan nimi:</h3>
        <input v-model="name" :disabled="course==''" placeholder="esim. Suomi, Eurooppa ja muuttuva maailma" />

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

        <h2>5. Hinta</h2>
        <input v-model="price_euros" class="price" type="number" min="0" max="100" required/> euroa
        <input v-model="price_cents" class="price" type="number" min="0" max="99" step="5" required/> senttiä
        <br><b>Anna hinta 5 sentin tarkkuudella</b>

        <h2>6. Tarkista tiedot</h2>
        <h3>Ovathan nämä tiedot varmasti oikein?</h3>
        <table>
          <tr>
            <th>Kurssi</th>
            <td>{{ course }}</td>
          </tr>
          <tr>
            <th>Kirjan nimi</th>
            <td>{{ series }} - {{ name }}</td>
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
            <td>{{ info }}</td>
          </tr>
          <tr>
            <th>Hinta</th>
            <td><currency :amount="parseInt(price_euros)*100 + parseInt(price_cents)" /></td>
          </tr>
        </table>

        <hr>
        <a href="#" class="button btn-l" @click.prevent="next">Jatka</a>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { EventBus } from '../EventBus'
import Currency from './currency'
import auth from '../api/auth'

export default {
  name: 'sell-new',
  components: {
    'currency': Currency
  },
  data () {
    return {
      subject: '',
      course: '',
      series: '',
      name: '',
      condition: 0,
      info: '',
      price_euros: '0',
      price_cents: '0',
      courseCount: {'ÄI': 9, 'EN': 8, 'RU': 7, 'MAY': 1, 'MAA': 12, 'MAB': 7, 'BI': 5, 'GE': 4, 'FY': 7, 'KE': 5, 'HI': 6, 'YH': 4, 'PS': 5, 'TT': 3, 'FI': 4, 'UE': 6, 'UO': 6, 'ET': 6, 'OP': 2, 'LI': 5, 'MU': 4, 'KU': 4}
      // remember to update this to buy-list.vue too
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
        name: (this.series + ' - ' + this.name),
        condition: this.condition,
        info: this.info,
        price: (parseInt(this.price_euros) * 100 + parseInt(this.price_cents))
      }).then(response => {
        console.log('Success')
        /* if (this.$route.query.redirect) {
          this.$router.replace(this.$route.query.redirect)
        } else {
          this.$router.replace('/')
        } */
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Incorrect information')
        } else if (error.response.status === 504) {
          console.log('Timeout')
        } else {
          console.log('Error ' + error.response.status)
        }
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
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
</style>
