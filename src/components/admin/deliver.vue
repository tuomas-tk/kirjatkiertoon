<template>
<div class="maxwidth">
  <h1>Luovuta kirja</h1>
  Haluatko sittenkin <router-link to="/admin/receive">vastaanottaa kirjan myyjältä</router-link>?
</div>
</template>

<script>

import axios from 'axios'
import auth from '../../api/auth'
import { EventBus } from '../../EventBus'
import Currency from '../currency'
// import { TOTAL_FEE } from '../../Static'

export default {
  components: {
    'currency': Currency
  },
  data () {
    return {
    }
  },
  created () {
    console.log('created')
    this.load()
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
