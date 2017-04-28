import axios from 'axios'
import { EventBus } from '../EventBus'

const LOCALSTORAGE_TOKEN = 'login_token'

export default {

  status: null,
  // 0 = not authenticated
  // 1 = authenticated as a buyer
  // 2 = authenticated as a seller
  // 3 = authenticated as a superuser
  firstname: null,
  lastname: null,
  id: null,

  saveToken (token) {
    if (token != null) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token)
    }
  },

  // To log out, we just need to remove the token
  removeToken () {
    localStorage.removeItem(LOCALSTORAGE_TOKEN)
    this.status = 0
    this.firstname = null
    this.lastname = null
    this.id = null
  },

  getToken: () => localStorage.getItem(LOCALSTORAGE_TOKEN),

  checkAuth () {
    console.log('[1] Checking authentication')

    if (this.getToken()) {
      console.log('  [2] Token found, fetching user information')
      return axios.post('/user/get/profile', {token: this.getToken()})
      .then(response => {
        this.status = response.data.data.type
        this.firstname = response.data.data.firstname
        this.lastname = response.data.data.lastname
        this.id = response.data.data.id
        console.log('    [3] Token valid -> AUTH-level ' + this.status)
      })
      .catch(error => {
        if (error.response.status === 400) {
          console.log('    [3] Invalid token')
          this.removeToken()
          return new Promise((resolve, reject) => { reject(500) })
        } else if (error.response.status === 500) {
          console.log('    [3] Server Error 500')
          console.log(error)
          EventBus.$emit('setServerError', 2)
          return new Promise((resolve, reject) => { reject(500) })
        } else {
          console.log(error)
          EventBus.$emit('setServerError', 1)
        }
      })
    } else {
      console.log('  [2] No token')
      this.removeToken()
      return new Promise((resolve, reject) => { reject('no token') })
    }
  }
}
