<template>
  <span>{{ number }} €</span>
</template>

<script>
export default {
  name: 'currency',
  props: ['amount'],
  computed: {
    number: function () {
      return (this.amount / 100).toFixed(2)
    }
  }
}
</script>
