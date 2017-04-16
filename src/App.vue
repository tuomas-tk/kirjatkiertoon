<template>
  <div id="app">
    <header>
      <div id="header-container">
        <img id="logo" src="./assets/logo-nobg-200.png" />
        <div class="nav-bar">
          <router-link to="/frontpage">Etusivu</router-link>
          <router-link to="/buy">Osta kirja</router-link>
          <router-link to="/sell">Myy kirja</router-link>
          <router-link to="/profile">Profiili</router-link>
        </div>
        <div class="nav-bar nav-bar-right">
          <router-link to="/login">Kirjaudu sisään</router-link>
        </div>
      </div>
    </header>
    <div id="page">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="stylus">
@import "./styles/normalize.css"
@import "./styles/vars"

html, body, #app
  margin 0
  padding 0
  background-color: #F0F0F0

#app {
  font-family: 'Raleway', Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #333333
}

header {
  background-color: _color-deep-purple-500
  margin: 0
  height: 80px
  box-shadow: 0 -10px 50px rgba(0,0,0, 1),
              0 0 5px rgba(0,0,0, 0.4)

  #header-container {
    padding-left: 2em
    max-width: 1600px
    margin: 0 auto
  }

  img#logo {
    display: inline-block
    height: 70px
    padding-top: 5px
    padding-right: 1em
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
}

#page {
  padding: 3em 2em
  max-width: 1600px
  margin: 0 auto

  font-size: 16px
  line-height: 1.6em

  h1, h2 {
    font-family: Neucha
    font-weight: 400
  }
  h1 {
    font-size 4em
    color _color-deep-purple-700
    padding-top 0.8em
    padding-bottom 0.5em
  }
  h2 {
    font-size 1.2em
  }
  p {
    max-width 700px
  }

  &>div {
    position: absolute;
  }
}

</style>
