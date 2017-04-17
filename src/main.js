require('babel-polyfill')

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from 'axios'

Axios.defaults.baseURL = 'http://192.168.0.54:8080/api/'
Vue.config.productionTip = false

console.log('main.js')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
