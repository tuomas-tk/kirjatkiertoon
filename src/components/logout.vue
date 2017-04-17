<template>
  <div class="maxwidth">
    <div v-if="error">
      <h1>Uloskirjautumisessa tapahtui virhe</h1>
      <h2>{{ error }}</h2>
    </div>
    <div v-else>
      <h1>Olet nyt kirjautunut ulos</h1>
      <h2>Toivottavasti näemme sinut pian!</h2>
      <router-link to="/" class="button btn-m">Etusivulle</router-link>
      <router-link to="/login" class="button btn-m">Kirjaudu sisään</router-link>
    </div>
  </div>
</template>

<script>
import auth from '../api/auth'
import axios from 'axios'

export default {
  name: 'login',
  data: () => ({
    'error': null
  }),
  created () {
    axios.post('/logout', {
      token: auth.getToken()
    }).then(response => {
      console.log('logout success')
      auth.removeToken()
    }).catch(error => {
      if (error.response.status === 400) {
        console.log('Invalid token')
        this.error = 'Olet jo kerran kirjautunut ulos!'
        auth.removeToken()
      } else {
        console.log('Error ' + error.response.status)
        this.error = 'Virhe ' + error.response.status + '.'
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import "../styles/vars"

div {
  text-align: center
}
</style>
