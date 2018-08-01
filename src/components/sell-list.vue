<template>
  <div>
    <div class="maxwidth">
      <h1>Myytävät kirjat</h1>

      <router-link to="/sell/new" class="button btn-l" id="sell-new-button">Myy uusi kirja</router-link>

      <h3>Tilojen selitykset</h3>
      <table id="statustable">
        <tr><th>TOIMITA KOULULLE</th><td><b>Kirja on ostettu, mutta et ole vielä toimittanut sitä koululle. Toimita mahdollisimman pian!</b></td></tr>
        <tr><th>MYYNNISSÄ</th><td>Kukaan ei ole ostanut kirjaa.</td></tr>
        <tr><th>MYYTY</th><td>Kirja on toimitettu ostajalle</td></tr>
      </table>
    </div>

    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Kurssi</th>
            <th>Kirja</th>
            <th>Hinta <small>ostajalle</small></th>
            <th>Tila</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books">
            <td>{{ book.course }}</td>
            <td class="name">
              <router-link :to="{name: 'sellSingle', params: { id: book.id }}">
                {{ book.name }}
              </router-link>
            </td>
            <td class="price"><currency :amount="book.price" /></td>
            <td class="status">
              <span v-if="book.status == 0"><i class="fa fa-check"></i><br>MYYNNISSÄ</span>
              <span v-if="book.status == 1"><i class="fa fa-clock-o"></i><br>TOIMITA KOULULLE</span>
              <span v-if="book.status >= 2"><i class="fa fa-handshake-o"></i><br>MYYTY</span>
            </td>
            <td class="buttons">
              <router-link class="button btn-s":to="{name: 'sellSingle', params: { id: book.id }}">Avaa</router-link>
              <span class="button btn-s btn-red" @click="poista(book.id)" v-if="book.status == 0">Poista</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <sell-single :id="selectedBook" v-if="selectedBook" />
  </div>
</template>
<script>
import axios from 'axios'
import auth from '../api/auth'
import { EventBus } from '../EventBus'
import Currency from './currency'
import SellSingle from './sell-single'

export default {
  name: 'sell-list',
  components: {
    'currency': Currency,
    'sell-single': SellSingle
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
    },
    poista: function (id) {
      var deleteConfirm = confirm('Haluatko varmasti poistaa kirjan?')
      if (!deleteConfirm) return
      axios.post('/book/delete/' + id, {
        token: auth.getToken()
      }).then(response => {
        this.load()
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Invalid token')
        } else {
          console.log('Error ' + error.response.status)
        }
      })
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

table {
  td.status {
    i.fa-check {
      color: _color-deep-purple-700
    }
    i.fa-clock-o {
      color: _color-orange-900
    }
    i.fa-handshake-o {
      color: _color-green-900
    }
  }
  td.buttons {
    text-align: right;
  }
}
</style>
