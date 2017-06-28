<template>
<div>
  <div class="maxwidth">
    <div class="search">
      <table>
        <tr>
          <th>Etunimi</th>
          <td>
            <input type="text" v-model="firstname" placeholder="Matti" />
          </td>
        </tr>
        <tr>
          <th>Sukunimi</th>
          <td>
            <input type="text" v-model="lastname" placeholder="Meikäläinen" />
          </td>
        </tr>
      </table>
      <div class="bottom">
        <router-link class="button btn-m" :to="{name: 'adminUserList', query: {firstname: firstname, lastname: lastname}}">Hae</router-link>
      </div>
    </div>

    <div class="addeduser" v-if="added.passcode">
      <h2>Käyttäjän lisäys onnistui!</h2>
      <table>
        <tr>
          <th>Etunimi</th>
          <td>{{ added.firstname }}</td>
        </tr>
        <tr>
          <th>Sukunimi</th>
          <td>{{ added.lastname }}</td>
        </tr>
        <tr>
          <th>Tyyppi</th>
          <td>{{ added.type }}</td>
        </tr>
        <tr>
          <th>Sähköposti</th>
          <td>{{ added.email }}</td>
        </tr>
        <tr>
          <th>Tunnuskoodi</th>
          <td class="passcode">{{ added.passcode }}</td>
        </tr>
      </table>
    </div>
  </div>


  <div class="table" id="table">
    <table>
      <thead>
        <tr>
          <th>Etunimi</th>
          <th>Sukunimi</th>
          <th>Email</th>
          <th>Tunnuskoodi</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr class="newuser">
          <td><input type="text" v-model="newuser.firstname" placeholder="Matti" /></td>
          <td><input type="text" v-model="newuser.lastname" placeholder="Meikäläinen" /></td>
          <td><input type="text" v-model="newuser.email" placeholder="matti.meikalainen@example.com" /></td>
          <td><select v-model="newuser.type">
            <option value="1">Yleinen ostotili</option>
            <option value="2">Vain ostaja</option>
            <option value="5">Ostaja ja myyjä</option>
            <option value="10">Järjestäjä</option>
          </select></td>
          <td>
            <a href="#" class="button btn-s" @click.prevent="save">Tallenna</a>
          </td>
        </tr>
        <tr v-for="user in users">
          <td>{{ user.firstname }}</td>
          <td>{{ user.lastname }}</td>
          <td>{{ user.email }}</td>
          <td class="passcode"><passcode :passcode="user.passcode" /></td>
          <td>
            <a href="#" class="button btn-s" @click.prevent="edit">Muokkaa</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import axios from 'axios'
import auth from '../../api/auth'
import { EventBus } from '../../EventBus'
import Passcode from '../passcode'

export default {
  components: {
    'passcode': Passcode
  },
  data () {
    return {
      users: [],
      firstname: this.$route.query.firstname || '',
      lastname: this.$route.query.lastname || '',
      newuser: {
        firstname: '',
        lastname: '',
        email: '',
        type: '2'
      },
      added: {
        firstname: '',
        lastname: '',
        email: '',
        type: '',
        passcode: ''
      }
    }
  },
  created () {
    console.log('created')
    this.load()
  },
  watch: {
    '$route.query': 'load'
  },
  methods: {
    load: function () {
      EventBus.$emit('setLoading', true)
      console.log('load: ' + this.$route.fullPath)
      axios.post('/admin/get/users', {
        firstname: this.$route.query.firstname,
        lastname: this.$route.query.lastname,
        token: auth.getToken()
      }).then(response => {
        this.users = response.data.data
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
    edit: function () {
    },
    save: function () {
      EventBus.$emit('setLoading', true)
      console.log('load: ' + this.$route.fullPath)
      axios.post('/admin/add/user', {
        firstname: this.newuser.firstname,
        lastname: this.newuser.lastname,
        email: this.newuser.email,
        type: this.newuser.type,
        token: auth.getToken()
      }).then(response => {
        this.added.firstname = response.data.data.firstname
        this.added.lastname = response.data.data.lastname
        this.added.email = response.data.data.email
        this.added.passcode = response.data.data.passcode
        this.added.type = response.data.data.type

        this.newuser.firstname = ''
        this.newuser.lastname = ''
        this.newuser.email = ''
        this.load()
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

<style lang="stylus" scoped>
@import '../../styles/vars'
@import '../../styles/tables'

#page h1 {
  float: left
  margin-bottom: 0
}
#sell-new-button {
  margin-top: 1.8em
  float: right
}

.search {
  border: 1px solid #BBBBBB
  border-radius: 5px
  padding: 1.5em 2em
  clear: both

  table {
    border-collapse: collapse
    width: 100%

    th {
      border-right: 2px solid #aaaaaa
      text-align: right;
      padding: .2em 1em
    }

    td {
      padding: .4em .3em
      width: 100%

      input, select {
        width: 100%
      }
    }

    td.separator {
      padding: 0
      border-bottom: 2px solid #aaaaaa
    }
  }

  .bottom {
    text-align: right
    border-top: 1px solid #CCCCCC
    margin-top 2em
    text-align: center
    .button {
      margin-bottom: 0
      text-align: center
    }
  }
}

div.addeduser {
  background-color: #FFFFFF
  border: 1px solid #BBBBBB
  border-radius: 5px
  padding: 2em 2em
  margin-top: 2em

  table {
    border-collapse: collapse
    th {
      text-align: right
    }
    th,td {
      border: 1px solid #cccccc
      padding: 0.2em 0.5em
    }
    td.passcode {
      font-size: 1.5em
      font-family: monospace
    }
  }
}

#table {
  font-size: 0.8em

  td {
    padding: 0 .2em !important
  }

  tr.newuser {

    td {
      border-bottom: 3px solid #aaaaaa !important
      padding: 1em

      input {
        width: 100%
        font-size: 1.3em
        padding: 0.5em
        box-sizing: border-box
      }
    }
  }

  td.passcode {
    font-size: 1.5em
    font-family: monospace
  }
}

</style>
