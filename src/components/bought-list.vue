<template>
<div>
  <div class="maxwidth">
    <router-link to="/buy" class="button btn-m" @click="back">Takaisin</router-link>
    <h1>Ostetut kirjat</h1>
    <h3>
      Tästä näet kaikkien ostamiesi kirjojen tilanteen.
    </h3>
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
            <router-link :to="{name: 'boughtSingle', params: { id: book.id }}">
              {{ book.name }}
            </router-link>
          </td>
          <td class="price"><currency :amount="book.price" /></td>
          <td class="status">
            <span v-if="book.status == 1"><i class="fa fa-clock-o"></i><br>ODOTTAA SAAPUMISTA</span>
            <span v-if="book.status == 2"><i class="fa fa-exclamation-triangle"></i><br>NOUDA KOULULTA</span>
            <span v-if="book.status >= 3"><i class="fa fa-check"></i><br>OSTETTU</span>
          </td>
          <td>
            <router-link class="button btn-s":to="{name: 'boughtSingle', params: { id: book.id }}">Avaa</router-link>
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
  name: 'buy-own-list',
  components: {
    'currency': Currency,
    'buy-single': BuySingle
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
      axios.post('/book/get/bought', {
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
    back: function () {
      this.$router.go(-1)
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
  clear: both

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

td.status {
  i.fa-exclamation-triangle {
    color: _color-deep-purple-500
  }
  i.fa-clock-o {
    color: _color-orange-900
  }
  i.fa-check {
    color: _color-green-900
  }
}

</style>
