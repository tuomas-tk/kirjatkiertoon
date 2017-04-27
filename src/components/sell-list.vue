<template>
  <div>
    <div class="maxwidth">
      <h1>Omat kirjat</h1>

      <router-link to="/sell/new" class="button btn-l" id="sell-new-button">Myy uusi kirja</router-link>

      <h3>Tilojen selitykset</h3>
      <table id="statustable">
        <tr><th>MYYNNISSÄ</th><td>Kukaan ei ole ostanut kirjaa.</td></tr>
        <tr><th>ODOTTAA TOIMITUSTA</th><td>Kirja on ostettu, mutta et ole vielä toimittanut sitä koululle</td></tr>
        <tr><th>MYYTY</th><td>Kirja on toimitettu ostajalle</td></tr>
      </table>
    </div>

    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Kurssi</th>
            <th>Kirja</th>
            <th>Hinta</th>
            <th>Tila</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books">
            <td>{{ book.course }}</td>
            <td class="name">
              <router-link :to="{name: 'buySingle', params: { id: book.id }}">
                {{ book.name }}
              </router-link>
            </td>
            <td class="price"><currency :amount="book.price" /></td>
            <td class="status">
              <span v-if="book.status == 0"><i class="fa fa-check"></i><br>MYYNNISSÄ</span>
              <span v-if="book.status == 1"><i class="fa fa-clock-o"></i><br>ODOTTAA TOIMITUSTA</span>
              <span v-if="book.status == 2"><i class="fa fa-times"></i><br>MYYTY</span>
            </td>
            <td>
              <router-link class="button btn-s":to="{name: 'buySingle', params: { id: book.id }}">Avaa</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import auth from '../api/auth'
import { EventBus } from '../EventBus'
import Currency from './currency'

export default {
  name: 'sell-list',
  components: {
    'currency': Currency
  },
  data () {
    return {
      books: []
    }
  },
  created () {
    this.load()
  },
  methods: {
    load: function () {
      EventBus.$emit('setLoading', true)
      axios.post('/book/get/own', {
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import '../styles/tables'

#page h1 {
  float: left
  margin-bottom: 0
}
#sell-new-button {
  margin-top: 1.8em
  float: right
}

h3 {
  clear: both
  padding-top: 2em
}

table#statustable {
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
}
</style>
