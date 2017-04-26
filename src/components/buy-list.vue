<template>
<div>
  <div class="maxwidth">
    <h1>Osta kirja</h1>
    <div class="search">
      <h3>Oppiaine:</h3>
      <select v-model="subject" @change="changeSubject">
        <option value="">Kaikki</option>
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

      <h3>Kurssi:</h3>
      <select v-model="course">
        <option value="">Kaikki</option>
        <option v-for="n in (this.courseCount[subject])">{{ subject }}{{ n }}</option>
      </select>

      <!--<div class="bottom">
        <router-link class="button btn-m":to="{name: 'buyList', params: {}}">Hae</router-link>
      </div>-->
    </div>
  </div>

  <div class="table">
    <table>
      <thead>
        <tr>
          <th>Kurssi</th>
          <th>Kirja</th>
          <th>Hinta</th>
          <th>Kunto</th>
          <th>Tila</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" v-if="book.status < 3 && (subject == '' || (course == '' && book.course.startsWith(subject)) || (book.course == course))">
          <td>{{ book.course }}</td>
          <td class="name">
            <router-link :to="{name: 'buySingle', params: { id: book.id }}">
              {{ book.name }}
            </router-link>
          </td>
          <td class="price"><currency :amount="book.price" /></td>
          <td class="condition">
            <i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i>
          </td>
          <td class="status">
            <i class="fa fa-check" v-if="book.status == 0"></i>
            <i class="fa fa-clock-o" v-if="book.status == 1"></i>
            <i class="fa fa-times" v-if="book.status == 2"></i>
          </td>
          <td>
            <router-link class="button btn-s":to="{name: 'buySingle', params: { id: book.id }}">Avaa</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <buy-single :id="selectedBook" v-if="selectedBook" />
</div>
</template>

<script>
import axios from 'axios'
import auth from '../api/auth'
import { EventBus } from '../EventBus'
import Currency from './currency'
import BuySingle from './buy-single'

export default {
  name: 'buy-list',
  components: {
    'currency': Currency,
    'buy-single': BuySingle
  },
  data () {
    return {
      books: [],
      subject: '',
      course: '',
      courseCount: {
        'ÄI': 9,
        'EN': 8,
        'RU': 7,
        'MAY': 1,
        'MAA': 7,
        'MAB': 12,
        'BI': 5,
        'GE': 4,
        'FY': 7,
        'KE': 5,
        'HI': 6,
        'YH': 4,
        'PS': 5,
        'TT': 3,
        'FI': 4,
        'UE': 6,
        'UO': 6,
        'ET': 6,
        'OP': 2,
        'LI': 5,
        'MU': 4,
        'KU': 4
      }
    }
  },
  created () {
    this.load()
  },
  methods: {
    load: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/book/get', {
        token: auth.getToken()
      }).then(response => {
        this.books = response.data.data
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    changeSubject: function () {
      console.log('changeSubject')
      this.course = ''
    }
  },
  computed: {
    selectedBook: function () {
      EventBus.$emit('setModalOpen', this.$route.params.id)
      return this.$route.params.id
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../styles/vars'
@import '../styles/tables'

.search {
  border: 1px solid #BBBBBB
  border-radius: 5px
  padding: 1em 2em 2em 2em

  h3 {
    margin: 1em 0 .5em 0
  }

  .bottom {
    text-align: right
    border-top: 1px solid #CCCCCC
    margin-top 2em
    .button {
    }
  }
}

</style>
