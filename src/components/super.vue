<template>
  <div class="maxwidth">
    <h1>SuperConsole</h1>
  </div>
</template>

<script>
// import axios from 'axios'

export default {
  name: 'super',
  data: () => ({
    msg: 'Welcome to KirjatKiertoon!'
  })/* ,
  created () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData () {
      console.log('created')
      axios.get(`/books`)
        .then(response => {
          console.log('fetched')
          // JSON responses are automatically parsed.
          this.msg = response.data[0].title
        })
        .catch(e => {
          console.log('error')
          console.log(e)
        })
    }
  } */
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
