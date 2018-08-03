<template>
  <tr :class="{'updating': updating}">
    <td></td>
    <td><input type="text" v-model="user.firstname" placeholder="Matti" /></td>
    <td><input type="text" v-model="user.lastname" placeholder="Meikäläinen" /></td>
    <td><input type="email" v-model="user.email" placeholder="matti.meikalainen@example.com" /></td>
    <td class="passcode">
      <passcode :passcode="user.passcode" :hidden="false" />
      <a href="#" @click.prevent="randomPasscode">Satunnainen</a><br>
      <a href="#" @click.prevent="inputPasscode">Syötä</a>
    </td>
    <td><select v-model="user.type">
      <option value="1">{{ getRoleName(1) }}</option>
      <option value="2">{{ getRoleName(2) }}</option>
      <option value="5">{{ getRoleName(5) }}</option>
      <option value="10">{{ getRoleName(10) }}</option>
      <option value="15">{{ getRoleName(15) }}</option>
      <option value="42">{{ getRoleName(42) }}</option>
    </select></td>
    <td>
      <a href="#" class="button btn-s btn-block btn-red" @click.prevent="cancel" v-if="updating"><i class="fa fa-times"></i> Peruuta</a>
      <a href="#" class="button btn-s btn-block btn-green" @click.prevent="save"><i class="fa fa-floppy-o"></i> Tallenna</a>
        <div class="error" v-if="error">
        <div>Virhe: {{ error }} <a href="#" @click.prevent="error = null"><i class="fa fa-times" ></i></a></div>
      </div>
    </td>
  </tr>
</template>
<script>
import axios from 'axios'
import auth from '../../api/auth'
import { EventBus } from '../../EventBus'
import { GET_ROLE_NAME } from '../../Static'
import Passcode from '../passcode'

export default {
  name: 'editable-user-row',
  components: {
    'passcode': Passcode
  },
  props: {
    'updating': {
      type: Boolean,
      default: false
    },
    'initialUser': {
      type: Object,
      default: () => {
        return {
          firstname: '',
          lastname: '',
          email: '',
          passcode: '',
          type: 2
        }
      }
    }
  },
  data () {
    return {
      user: {
        firstname: this.initialUser.firstname,
        lastname: this.initialUser.lastname,
        email: this.initialUser.email,
        passcode: this.initialUser.passcode,
        type: this.initialUser.type
      },
      error: null
    }
  },
  methods: {
    cancel: function () {
      this.user.firstname = ''
      this.user.lastname = ''
      this.user.email = ''
      this.user.passcode = ''
      this.$emit('cancel')
    },
    save: function () {
      this.error = null
      EventBus.$emit('setLoading', true)
      // console.log(this.updating ? ('/admin/edit/user/' + this.initialUser.id) : '/admin/add/user')
      axios.post(this.updating ? ('/admin/edit/user/' + this.initialUser.id) : '/admin/add/user', {
        firstname: this.user.firstname,
        lastname: this.user.lastname,
        email: this.user.email,
        passcode: this.user.passcode,
        type: this.user.type,
        token: auth.getToken()
      }).then(response => {
        /* var added
        added.firstname = response.data.data.firstname
        added.lastname = response.data.data.lastname
        added.email = response.data.data.email
        added.passcode = response.data.data.passcode
        added.type = response.data.data.type */
        this.$emit(this.updating ? 'user-updated' : 'user-added', response.data.data)
        this.cancel()
      }).catch(error => {
        if (error.response.status === 400) {
          this.error = 'tietoja puuttuu'
        } else if (error.response.status === 403) {
          this.error = 'oikeutesi eivät riitä'
        } else if (error.response.status === 409) {
          this.error = 'sähköpostiosoite on jo käytössä'
        } else {
          this.error = error.response.status + ' ' + error.response.data.data
          console.log('Error ' + error.response.status)
        }
      }).then(() => {
        EventBus.$emit('setLoading', false)
      })
    },
    randomPasscode: function () {
      console.log('moiii')
      const possible = 'abcdefghijklmnopqrstuvwxyz123456789' // 35 characters
      var passcode = ''
      for (var i = 0; i < 8; i++) {
        passcode += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      this.user.passcode = passcode
    },
    inputPasscode: function () {
      var passcode = prompt('Syötä uusi tunnuskoodi')
      if (passcode && passcode.trim()) this.user.passcode = passcode.trim()
    },
    getRoleName: GET_ROLE_NAME
  }
}
</script>
<style lang="stylus" scoped>
@import '../../styles/vars'

tr {
  position: relative
  td {
    background-color: #C0C0C0
    border-bottom: 3px solid _color-deep-purple-500
    border-top: 3px solid _color-deep-purple-500
    padding: .5em .5em
    color: black

    input {
      width: 100%
      font-size: 1.2em
      padding: 0.2em 0.5em
      box-sizing: border-box
    }

    &.passcode {
      a {
        color: black
      }
    }

    &:first-child {
      border-left: 3px solid _color-deep-purple-500
      border-radius: 0 0 0 5px
    }
    &:last-child {
      border-right: 3px solid _color-deep-purple-500
      border-radius: 0 0 5px 0
    }
  }

  &.updating {
    td {
      border: none
    }
  }
}

tr:hover div.error div {
  background-color: _color-red-900
}

div.error {
  position: absolute
  bottom: -2em
  left: 0
  height: 2em
  width: 100%
  text-align: center
  div {
    display: inline-block
    background-color: _color-red-900
    background-color: rgba(_color-red-900, 0.4)
    color: white
    text-align: center
    font-size: 1rem
    padding: 0.3em 0.5em 0.3em 3em
    font-weight: 700
    border-bottom-left-radius: 5px
    border-bottom-right-radius: 5px

    a {
      color: white
      margin-left: 1.2em

      &:hover, &:active {
        color: black
        outline: 1px solid white
      }
    }
  }
}

</style>
