<template>
<div>
  <div class="maxwidth">
    <div class="search">
      <table>
        <tr>
          <th rowspan="5">KIRJA</th>
          <th>Oppiaine</th>
          <td>
            <select v-model="subject" @change="changeSubject">
              <option value="">Kaikki</option>
              <optgroup label="Kielet">
                <option value="ÄI">ÄI - Äidinkieli</option>
                <option value="EN">EN - Englanti</option>
                <option value="RU">RU - Ruotsi</option>
                <option value="SA">SA - Saksa</option>
                <option value="RA">RA - Ranska</option>
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
          </td>
        </tr>
        <tr>
          <th>Kurssi</th>
          <td>
            <select v-model="course">
              <option :value="subject + '%'">Kaikki</option>
              <option :value="subject">Kaikkien kurssien kirja (käsikirja tms)</option>
              <option v-for="n in (this.courseCount[subject])">{{ subject }}{{ n }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>Nimi</th>
          <td>
            <input type="text" v-model="name" />
          </td>
        </tr>
        <tr>
          <th>Säilytyskoodi</th>
          <td>
            <input type="text" v-model="code" placeholder="XXXXX" />
          </td>
        </tr>
        <tr>
          <th>Tila</th>
          <td>
            <select v-model="status">
              <option value="">Kaikki</option>
              <option value="0">Myytävänä</option>
              <option value="1">Toimitettava koululle</option>
              <option value="2">Noudettava koululta</option>
              <option value="3">Toimitettu ostajalle</option>
            </select>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="separator"></td>
        </tr>
        <tr>
          <th rowspan="4">HENKILÖ</th>
          <th>Etunimi</th>
          <td>
            <input type="text" v-model="firstname" />
          </td>
        </tr>
        <tr>
          <th>Sukunimi</th>
          <td>
            <input type="text" v-model="lastname" />
          </td>
        </tr>
        <tr>
          <th>Sähköpostiosoite</th>
          <td>
            <input type="email" v-model="email" />
          </td>
        </tr>
        <tr>
          <th>Tunnuskoodi</th>
          <td>
            <input type="password" v-model="passcode" />
          </td>
        </tr>
      </table>
      <div class="bottom">
        <router-link class="button btn-m" :to="{name: 'adminBookList', query: {subject: subject, course: course, name: name, code: code, status: status, firstname: firstname, lastname: lastname, email: email, passcode: passcode}}">Hae</router-link>
      </div>
    </div>
  </div>

  <div class="table" id="table">
    <table>
      <thead>
        <tr>
          <th>Säilytyskoodi</th>
          <th>Kurssi</th>
          <th>Kirja</th>
          <th>Hinta ostajalle</th>
          <th>Hinta myyjälle</th>
          <th>Kunto</th>
          <th>Myyjä</th>
          <th>Ostaja</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books">
          <td>{{ book.code }}</td>
          <td>{{ book.course }}</td>
          <td class="name">
            <router-link :to="{name: 'buySingle', params: { id: book.id }}">
              {{ book.name }}
            </router-link>
          </td>
          <td class="price"><currency :amount="book.price" /></td>
          <td class="price"><currency :amount="book.price - totalFee" /></td>
          <td class="condition">
            <i class="fa fa-star" v-for="n in book.condition"></i><i class="fa fa-star-o" v-for="n in 5-book.condition"></i>
          </td>
          <td>
            {{ book.seller }}
          </td>
          <td>
            {{ book.buyer }}
          </td>
          <td>
            <router-link class="button btn-s" :to="{name: 'adminBookSingle', params: { id: book.id }}">Avaa</router-link>
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
import auth from '../../api/auth'
import { EventBus } from '../../EventBus'
import Currency from '../currency'
import BuySingle from '../buy-single'
import { COURSES, TOTAL_FEE } from '../../Static'

export default {
  components: {
    'currency': Currency,
    'buy-single': BuySingle
  },
  data () {
    return {
      books: [],
      subject: this.$route.query.subject || '',
      course: this.$route.query.course || '',
      name: this.$route.query.name || '',
      code: this.$route.query.code || '',
      status: this.$route.query.status || '',
      firstname: this.$route.query.firstname || '',
      lastname: this.$route.query.lastname || '',
      email: this.$route.query.email || '',
      passcode: this.$route.query.passcode || '',
      courseCount: COURSES,
      totalFee: TOTAL_FEE
    }
  },
  created () {
    console.log('created')
    this.load()
  },
  watch: {
    '$route.query': 'load'
  },
  methods: {
    load: function () {
      EventBus.$emit('setLoading', true)
      console.log('load: ' + this.$route.fullPath)
      axios.post('/admin/get/books', {
        book: {
          course: this.$route.query.course,
          name: this.$route.query.name,
          code: this.$route.query.code,
          status: this.$route.query.status
        },
        person: {
          firstname: this.$route.query.firstname,
          lastname: this.$route.query.lastname,
          email: this.$route.query.email,
          passcode: this.$route.query.passcode
        },
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
      this.course = this.subject + '%'
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
@import '../../styles/vars'
@import '../../styles/tables'

#page h1 {
  float: left
  margin-bottom: 0
}
#sell-new-button {
  margin-top: 1.8em
  float: right
}

.search {
  border: 1px solid #BBBBBB
  border-radius: 5px
  padding: 1.5em 2em
  clear: both

  table {
    border-collapse: collapse
    width: 100%

    th {
      border-right: 2px solid #aaaaaa
      text-align: right;
      padding: .2em 1em
    }

    td {
      padding: .4em .3em
      width: 100%

      input, select {
        width: 100%
      }
    }

    td.separator {
      padding: 0
      border-bottom: 2px solid #aaaaaa
    }
  }

  .bottom {
    text-align: right
    border-top: 1px solid #CCCCCC
    margin-top 2em
    text-align: center
    .button {
      margin-bottom: 0
      text-align: center
    }
  }
}

#table {
  font-size: 0.8em

  td {
    padding: 0 .2em !important
  }

  a.button {
    margin: .4em 0
  }
}

</style>
