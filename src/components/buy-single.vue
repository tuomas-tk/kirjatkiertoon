<template>
  <div class="maxwidth">
    <h2>Kirjan tiedot</h2>
    <p>Selostus tähän</p>


    {{ book.id }}
    {{ book.subject }}
    {{ book.course }}
    {{ book.name }}
    {{ book.price }}
    {{ book.condition }}
    {{ book.status }}
    {{ book.info }}

    <div class="button btn-l">Osta</div><br>
    <div class="button btn-s">Lisää muistilistalle</div>

  </div>
</template>

<script>
import axios from 'axios'
import auth from '../api/auth'

export default {
  name: 'buy-single',
  data () {
    return {
      book: {}
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

table {
  // border-collapse: collapse;
  border-spacing: 0;
  width: 100%
  border-radius: 5px

  thead {
    // background-color: #BBBBBB
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
      border-bottom: 1px solid #C0C0C0

      td {
        padding: 1em .5em
      }
    }
  }
}

</style>
