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

    <div class="addeduser" v-if="added.type">
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
          <td>{{ getRoleName(added.type) }} ({{ added.type }})</td>
        </tr>
        <tr>
          <th>Sähköposti</th>
          <td>{{ added.email }}</td>
        </tr>
        <tr>
          <th>Tunnuskoodi</th>
          <td class="passcode"><passcode :passcode="added.passcode" :hidden="false"/></td>
        </tr>
      </table>
    </div>
  </div>


  <div class="table" id="table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Etunimi</th>
          <th>Sukunimi</th>
          <th>Sähköposti</th>
          <th>Tunnuskoodi</th>
          <th>Tyyppi</th>
          <th></th>
        </tr>
        <editable-user-row @user-added="userAdded"/>
      </thead>
      <tbody>
        <template v-for="user in users">
          <editable-user-row v-if="editing.includes(user.id)" :initialUser="user" :updating="true" @user-added="userAdded()" @cancel="cancel(user.id)"/>
          <tr v-else>
            <td class="passcode">#{{ user.id }}</td>
            <td>{{ user.firstname }}</td>
            <td>{{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td class="passcode"><passcode :passcode="user.passcode" /></td>
            <td>{{ getRoleName(user.type) }} ({{ user.type }})</td>
            <td>
              <a href="#" class="button btn-s btn-block" @click.prevent="editing.push(user.id)"><i class="fa fa-pencil fa-2x"></i></a>
            </td>
          </tr>
        </template>
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
import EditableUserRow from './editable-user-row'
import { GET_ROLE_NAME } from '../../Static'

export default {
  components: {
    'passcode': Passcode,
    'editable-user-row': EditableUserRow
  },
  data () {
    return {
      users: [],
      firstname: this.$route.query.firstname || '',
      lastname: this.$route.query.lastname || '',
      editing: [],
      added: {
        firstname: '',
        lastname: '',
        email: '',
        type: '',
        passcode: ''
      },
      error: null
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
      this.firstname = this.$route.query.firstname
      this.lastname = this.$route.query.lastname
      axios.post('/admin/get/users', {
        firstname: this.firstname,
        lastname: this.lastname,
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
    userAdded: function (newUser) {
      this.added = newUser
      this.load()
    },
    cancel: function (userID) {
      const i = this.editing.indexOf(userID)
      if (i !== -1) this.editing.splice(i, 1)
      this.load()
    },
    getRoleName: GET_ROLE_NAME
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
      font-size: 1.3em
    }
  }
}

#table {
  font-size: 0.8em

  thead th {
    border-bottom-left-radius: 0
    border-bottom-right-radius: 0
  }

  td {
    padding: 0 .2em
  }

  td.passcode {
    font-size: 1.5em
    font-family: monospace
  }

  a.button {
    margin: .4em 0
  }
}

</style>
