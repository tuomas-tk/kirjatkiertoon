<template>
  <div class="maxwidth">
    <h1>Kirjaudu sisään!</h1>
    <div class="form">
      <form v-on:submit.prevent="login">
        <input type="text" class="input" placeholder="Tunnuskoodi" maxlength="10" v-model="passcode">
        <input type="submit" class="submit button btn-m btn-block" value="Kirjaudu">
      </form>
      <p class="error" v-if="error===1">
        Virheellinen tunnuskoodi!
      </p>
      <p class="error" v-if="error===2">
        Palvelimeen ei saada yhteyttä
      </p>
      <p>
        Tunnuskoodin saat koulultasi palvelun toiminnasta vastaavalta taholta
      </p>
    </div>
  </div>
</template>

<script>
import auth from '../api/auth'
import axios from 'axios'

export default {
  name: 'login',
  data () {
    return {
      passcode: null,
      error: 0
    }
  },
  methods: {
    login: function () {
      axios.post('/login/', {
        passcode: this.passcode
      }).then(response => {
        console.log('login success')
        // JSON responses are automatically parsed.
        auth.status = response.data.data.user.type
        auth.firstname = response.data.data.user.firstname
        auth.lastname = response.data.data.user.lastname
        auth.saveToken(response.data.data.token)

        console.log('Logged in with status ' + auth.status)

        if (this.$route.query.redirect) {
          this.$router.replace(this.$route.query.redirect)
        } else {
          this.$router.replace('/')
        }
      }).catch(error => {
        if (error.response.status === 400) {
          console.log('Incorrect passcode')
          this.error = 1
        } else if (error.response.status === 504) {
          console.log('Timeout')
          this.error = 2
        } else {
          console.log('Error ' + error.response.status)
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

h1 {
  text-align: center
}

.form {
  background-color: #FFFFFF
  box-shadow: 1px 5px 20px rgba(0,0,0,0.1)
  border-radius: 5px
  padding: 3em 3em 2em 3em
  max-width: 300px
  margin: 0 auto;

  .input {
    display: block
    width: calc(100% - 1.6em)
    margin: 0
    padding: .3em .5em
    font-size: 1.5em
    text-align: left
  }
  .submit {
    /*display: block
    width: 100%
    margin: 0.5em 0 0 0
    padding: 0.4em 0
    font-size: 1.5em;

    cursor: pointer;

    background: _color-deep-purple-500
    color: #FFFFFF
    font-weight: 600
    border: 0
    border-radius: 5px

    text-shadow: 1px 2px 3px rgba(0,0,0,0.3)

    &:hover {
      background: _color-deep-purple-700
      box-shadow: 0 0 20px rgba(0,0,0,0.2) inset
    }*/
  }

  p {
    margin-top: 2em
    color: #777777
    font-size: 14px
    font-weight: 700
  }
  p.error {
    color: _color-red-500
  }
}
</style>
