<template>
  <div id="app">
    <header :class="{active: menuActive}">
      <div id="header-container">
        <router-link to="/" exact><img id="logo" src="./assets/logo-nobg-200.png" /></router-link>
        <i class="fa fa-bars fa-3x" id="nav-button" @click="toggleMenu"></i>
        <div class="nav-bar">
          <router-link to="/" exact>Etusivu</router-link>
          <router-link to="/buy" v-if="auth.status >= 1">Osta kirja</router-link>
          <router-link to="/sell" v-if="auth.status >= 2">Myy kirja</router-link>
          <router-link to="/super" v-if="auth.status >= 3">SuperConsole</router-link>
        </div>
        <div class="nav-bar nav-bar-right">
          <router-link to="/login" v-if="auth.status == 0">Kirjaudu sisään</router-link>
          <router-link to="/profile" v-if="auth.status != 0">Omat tiedot</router-link>
          <router-link to="/logout" v-if="auth.status != 0">Kirjaudu ulos</router-link>
        </div>
      </div>
    </header>
    <div id="page">
      <router-view @loading="setLoading"></router-view>
    </div>
    <div id="loading" :class="{show: loading}">
      <span>Loading</span>
    </div>
  </div>
</template>

<script>
import auth from './api/auth'
import { EventBus } from './EventBus'

export default {
  name: 'app',
  data: () => ({
    auth: auth,
    loading: true,
    menuActive: false
  }),
  created () {
    EventBus.$on('setLoading', this.setLoading)
    EventBus.$on('hideNavigation', () => { this.menuActive = false })
  },
  methods: {
    setLoading: function (status) {
      console.log('setLoading: ' + status)
      this.loading = status
    },
    toggleMenu: function () {
      this.menuActive = !this.menuActive
    }
  }
}
</script>

<style lang="stylus">
@import "./styles/normalize.css"
@import "./styles/vars"
@import "./styles/buttons"

html, body, #app
  margin 0
  padding 0
  background-color: #F0F0F0
  overflow-x: hidden

#app {
  font-family: 'Raleway', Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #333333

  font-size: 16px
  @media (max-width: _breakpoint-tablet) {
    font-size: 14px
  }
  @media (max-width: _breakpoint-mobile) {
    font-size: 12px
  }

}

header {
  background-color: _color-deep-purple-500
  margin: 0
  min-height: 80px
  box-shadow: 0 -10px 50px rgba(0,0,0, 1),
              0 0 5px rgba(0,0,0, 0.4)

  #header-container {
    padding-left: 1em
    max-width: 1600px
    margin: 0 auto
  }

  img#logo {
    display: inline-block
    height: 70px
    padding-top: 5px
    padding-right: 1em
  }

  #nav-button {
    display: none;
  }

  .nav-bar {
    vertical-align: top
    display: inline-block
    margin: 0
    padding: 0


    a {
      display: inline-block
      height: 100%
      line-height: 80px
      color: #EEEEEE
      padding: 0 1em
      font-weight: 700
      font-size: 1.2em
      cursor: pointer
      text-shadow: 1px 2px 3px rgba(0,0,0,0.2)
      text-decoration: none
      outline: 0;

      transition all 0.1s

      &:hover {
        background-color: _color-deep-purple-700
        color: #FFFFFF
        box-shadow: 0 0 20px rgba(0,0,0,0.1) inset
        text-decoration: underline
      }

      &.router-link-active {
        background-color: _color-deep-purple-700
        color: #FFFFFF
        box-shadow: 0 0 20px rgba(0,0,0,0.1) inset
      }

    }
  }

  .nav-bar-right {
    float: right;
  }


  @media (max-width: _breakpoint-nav) {
    #header-container {
      padding: 0
    }
    img#logo {
      padding-left: 1em
    }
    #nav-button {
      display: inline-block;
      color: #FFFFFF
      vertical-align: top
      line-height: 80px
      float: right
      padding-right: 0.5em
      padding-left: 0.5em
      cursor: pointer
    }
    .nav-bar, .nav-bar-right {
      display: block
      background-color: _color-deep-purple-500
      float: none
      width: 100%
      height: 0
      overflow: hidden
      opacity: 0
      transition:  opacity .5s

      a {
        display: block
        line-height: 2em
      }
    }
    .nav-bar-right {
      border-top: 2px solid rgba(255,255,255,0.2)
    }
    &.active .nav-bar, &.active .nav-bar-right {
      opacity: 1
      height: auto
    }
  }
}

#page {
  line-height: 1.6em

  .maxwidth {
    padding: 3em 2em
    max-width: 1600px
    margin: 0 auto
  }

  h1, h2 {
    font-family: Neucha
    font-weight: 400
  }
  h1 {
    font-size: 4em
    line-height: 1em
    color: _color-deep-purple-700
    margin-top: 0.8em
    margin-bottom: 0.8em
    text-shadow: 1px 2px 4px rgba(0,0,0,0.2)
  }
  h2 {
    font-size: 3em
    line-height: 1em
  }
}


#loading {
  position: fixed
  top: 0
  left: 0
  height: 100%
  width: 100%
  background-color: rgba(0,0,0,0.6)
  text-align: center
  transition: visibility 0s, opacity 1s linear;
  visibility: hidden
  opacity: 0

  &.show {
    visibility: visible
    opacity: 1
  }

  span {
    font-size: 2em
    color: #FFFFFF
    font-weight: 700
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-shadow: 0px 3px 10px #000000, 0px 0px 50px #000000
  }
}

</style>
