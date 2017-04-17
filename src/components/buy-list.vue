<template>
<div>
  <div class="maxwidth">
    <h1>Osta kirja</h1>
    <p></p>
  </div>

  <div class="table">
    <table>
      <thead>
        <tr>
          <th>Kurssi</th>
          <th>Kirjasarja</th>
          <th>Hinta</th>
          <th>Kunto</th>
          <th>Tila</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" v-if="book.status < 3">
          <td>{{ book.course }}</td>
          <td>{{ book.name }}</td>
          <td class="price">{{ book.price/100 }} €</td>
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

export default {
  name: 'buy-list',
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
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import '../styles/vars'

.table {
  width: 100%
  overflow-x: scroll
}

table {
  border-spacing: 0
  width: 100%
  border-radius: 5px
  padding: 0 2em;

  thead {
    color: #FFFFFF
    font-size: 1.2em
    box-shadow: 0px 2px 5px rgba(0,0,0,0.2)

    th {
      background-color: _color-deep-purple-500
      padding: 1em .5em
    }

    th:first-child {
      border-top-left-radius: 5px
      border-bottom-left-radius: 5px
    }
    th:last-child {
      border-top-right-radius: 5px
      border-bottom-right-radius: 5px
    }
  }

  tbody {

    tr {

      td {
        padding: .8em .4em
        border-bottom: 1px solid #CCCCCC
      }

      td.price {
        font-size: 1.8em
        font-weight: 700
        color: #444444
        white-space: nowrap
      }

      td.condition {
        text-align: center
        white-space: nowrap
        color: #444444
        font-weight: 700
        font-size: 1.5em

        i.fa-star {
          color: _color-amber-700
        }
        i.fa-star-o {
          color: #BBBBBB
        }
      }

      td.status {
        text-align: center
        font-size: 2.4em
        padding-top: 0
        padding-bottom: 0

        i.fa-check {
            color: _color-green-900
        }
        i.fa-clock-o {
            color: _color-orange-900
        }
        i.fa-times {
            color: _color-red-900

        }
      }
    }
  }
}

</style>
