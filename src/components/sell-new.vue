<template>
  <div class="maxwidth">
    <h1>Lisää kirja myyntiin</h1>
    <p>Tähän pieni selostus</p>
    <p><b>HUOMIO! Vain uuden opetussuunnitelman mukaisten kirjojen myynti sallittu!</b></p>

    <div class="form">
      <form>
        <input v-model="name"/>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'sell-new',
  data () {
    return {
      msg: 'Myy kirja'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
