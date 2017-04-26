<template>
  <div class="maxwidth">
    <h1>Omat myynnit</h1>
    <p>Tähän pieni selostus</p>

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
          <tr v-for="book in books">
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
</style>
