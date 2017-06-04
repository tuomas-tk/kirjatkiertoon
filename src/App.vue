<template>
  <div id="app">
    <header :class="{active: menuActive}">
      <div id="header-container">
        <router-link to="/" exact><img id="logo" src="./assets/logo-nobg-200.png" /></router-link>
        <i class="fa fa-bars fa-3x" id="nav-button" @click="toggleMenu"></i>
        <div class="nav-bar" v-if="auth.status < 10">
          <router-link to="/" exact>Etusivu</router-link>
          <router-link to="/buy" v-if="auth.status >= 1">Osta</router-link>
          <router-link to="/sell" v-if="auth.status >= 5">Myy</router-link>
        </div>
        <div class="nav-bar" v-if="auth.status >= 10">
          <router-link to="/" exact>Etusivu</router-link>
          <router-link to="/admin/books">Kirjat</router-link>
          <router-link to="/admin/users">Käyttäjät</router-link>
          <router-link to="/admin/manage" v-if="auth.status >= 15">Hallinta</router-link>
        </div>
        <div class="nav-bar" v-if="auth.status == 42">
          <router-link to="/super">SuperConsole</router-link>
        </div>
        <div class="nav-bar nav-bar-right">
          <router-link to="/login" v-if="auth.status == 0">Kirjaudu sisään</router-link>
          <!--<router-link to="/profile" v-if="auth.status != 0">{{ auth.firstname }}</router-link>-->
          <router-link to="/logout" v-if="auth.status != 0">Kirjaudu ulos</router-link>
        </div>
      </div>
    </header>
    <div id="page">
      <router-view @loading="setLoading"></router-view>
    </div>
    <footer>
      KirjatKiertoon.fi <br>
      &copy; 2017 Tuomas Karjalainen / <a href="https://FirmatVerkkoon.fi">FirmatVerkkoon.fi</a>
    </footer>
    <div id="loading" :class="{show: loading}">
      <span>Loading</span>
    </div>
    <div id="servererror" :class="{show: serverError}">
      <div class="box">
        <h2>Palvelimeen ei voida yhdistää</h2>
        <p>
          Tarkista nettiyhteytesi.
        </p>
        <p>
          Voi myös olla että palvelin ei toimi. Pahoittelemme häiriötä!
        </p>
        <a href="" @click.prevent="serverOk" class="button btn-s">OK</a>
      </div>
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
    menuActive: false,
    serverError: false
  }),
  created () {
    EventBus.$on('setLoading', this.setLoading)
    EventBus.$on('setServerError', this.setServerError)
    EventBus.$on('hideNavigation', () => { this.menuActive = false })
    EventBus.$on('setModalOpen', this.setModalOpen)
  },
  methods: {
    setLoading: function (status) {
      this.loading = status
    },
    setServerError: function (status) {
      console.log('setServerError: ' + status)
      if (status) {
        this.loading = false
      }
      this.serverError = status
    },
    toggleMenu: function () {
      this.menuActive = !this.menuActive
    },
    setModalOpen: function (status) {
      if (status) {
        document.documentElement.style.overflow = 'hidden'
      } else {
        document.documentElement.style.overflow = 'auto'
      }
    },
    serverOk: function (status) {
      this.serverError = 0
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
    max-width: _maxwidth
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

a {
  color: _color-deep-purple-500

  &:hover {
    color: _color-deep-purple-700
  }

  &:visited {
    color: _color-deep-purple-500
  }
}

hr {
  border: 0
  border-top: 3px solid #BBBBBB
  background: none
  margin-top: 4em
  width: 100%
}

footer {
  border-top: 1px solid #AAAAAA
  margin-top: 4em
  padding: 2em 0.5em
  text-align: center
  color: #777777

  a {
    color: #777777
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
  z-index: 1000

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

#servererror {
  position: fixed
  top: 0
  left: 0
  height: 100%
  width: 100%
  background-color: rgba(0,0,0,0.6)
  text-align: center
  display: none
  z-index: 1000

  &.show {
    display: block;
  }

  .box {
    background-color: #FFFFFF
    border-radius: 5px
    font-size: 1.5em
    padding: 1em 2em
    color: #333333
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0px 3px 10px #000000, 0px 0px 50px #000000
  }
}

</style>
