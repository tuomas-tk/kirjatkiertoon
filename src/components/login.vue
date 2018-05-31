<template>
  <div class="maxwidth">
    <div class="form">
      <h2>Kirjaudu sisään!</h2>
      <form v-on:submit.prevent="login">
        <h3>Ostaja, <small>valitse koulu</small></h3>
        <select v-model="school" v-on:change="passcode='';">
          <option disabled value="">-- VALITSE KOULU --</option>
          <option v-for="s in schools" :value="s.passcode">
            {{ s.name }}
          </option>
        </select>
        <strong>TAI</strong>
        <h3>Myyjä, <small>syötä tunnuskoodi</small></h3>
        <input type="text" class="input" placeholder="Tunnuskoodi" v-model="passcode" v-on:input="school='';">
        <input type="submit" class="submit button btn-m btn-block" value="Kirjaudu">
      </form>
      <p class="error" v-if="error===1">
        Virheellinen tunnuskoodi!
      </p>
      <p class="error" v-if="error===2">
        Palvelimeen ei saada yhteyttä
      </p>
    </div>
  </div>
</template>

<script>
import auth from '../api/auth'
import axios from 'axios'
import { EventBus } from '../EventBus'

export default {
  name: 'login',
  data () {
    return {
      schools: [
        {
          name: 'Nurmeksen lukio',
          passcode: 'a3jv f3k7'
        }
      ],
      school: '',
      passcode: null,
      error: 0
    }
  },
  methods: {
    login: function () {
      var passcode = this.school
      if (passcode === '') passcode = this.passcode
      axios.post('/login/', {
        passcode: passcode.toLowerCase().replace(' ', '')
      }).then(response => {
        console.log('login success')
        // JSON responses are automatically parsed.
        auth.status = response.data.data.user.type
        auth.firstname = response.data.data.user.firstname
        auth.lastname = response.data.data.user.lastname
        auth.email = response.data.data.user.email
        auth.saveToken(response.data.data.token)
        this.$emit('login')

        console.log('Logged in with status ' + auth.status)

        if (this.$route.query.redirect) {
          this.$router.replace(this.$route.query.redirect)
        } else {
          this.$router.replace('/')
        }
      }).catch(error => {
        console.log(error)
        if (error.response.status === 400) {
          console.log('Incorrect passcode')
          this.error = 1
        } else if (error.response.status === 504) {
          console.log('Timeout')
          this.error = 2
        } else {
          console.log('Error ' + error.response.status)
          EventBus.$emit('setServerError', 1)
        }
      })
    }
  },
  created () {
    console.log('created')
    if (auth.status > 0) {
      this.$router.replace('/')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import "../styles/vars"
@import "../styles/box"

h2 {
  text-align: center
}

.form {
  @extend .box

  padding: 1rem 2rem 2rem 2rem
  max-width: 400px
  margin: 0 auto;

  label {
    display: block;
  }

  select {
    width: 100%;
    padding: .45em .75em
    font-size: 1em
  }

  strong {
    display: block;
    text-align: center;
    font-size: 1.5em;
    border-top: 1px solid #aaa;
    border-bottom: 1px solid #aaa;
    background-color: #f0f0f0;
    margin: 1em -2rem;
    padding: .2em 0;
  }

  .input {
    display: block
    width: calc(100% - 1.6em)
    margin: 0
    padding: .3em .5em
    font-size: 1.5em
    text-align: left
  }

  p {
    margin-top: 1em
    color: #777777
    font-size: 14px
    font-weight: 700
  }
  p.error {
    color: _color-red-500
  }
}
</style>
