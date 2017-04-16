<template>
  <div id="app">
    <header>
      <div id="header-container">
        <img id="logo" src="./assets/logo-nobg-200.png" />
        <ul class="nav-bar">
          <li class="nav-item">Etusivu</li>
          <li class="nav-item">Osta kirja</li>
          <li class="nav-item">Myy kirja</li>
          <li class="nav-item">Profiili</li>
        </ul>
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

html, body
  margin 0
  padding 0

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #333333
  padding: 0
  margin: 0
}

header {
  background-color: #673ab7
  margin: 0
  height: 80px
  box-shadow: 0 -10px 50px rgba(0,0,0, 1),
              0 0 5px rgba(0,0,0, 0.4)

  #header-container {
    padding: 0 3em
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


    .nav-item {
      display: inline-block
      line-height: 80px
      color: #EEEEEE
      padding: 0 1em
      font-weight: 600
      font-size: 1.2em
      cursor: pointer
      text-shadow: 1px 2px 3px rgba(0,0,0,0.2)

      &:hover {
        background-color: #512da8
        color: #FFFFFF
        box-shadow: 0 0 20px rgba(0,0,0,0.1) inset
      }
    }
  }
}

#page {
  padding: 2em 3em
  max-width: 1600px
  margin: 0 auto
}
</style>
