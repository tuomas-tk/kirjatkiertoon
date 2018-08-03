<template>
  <span class="passcode-text" :class="{'hidden': hidden}">{{ formatted }}</span>
</template>

<script>
export default {
  name: 'passcode',
  props: {
    'passcode': {
      type: String,
      default: ''
    },
    'hidden': {
      type: Boolean,
      default: true
    }
  },
  computed: {
    formatted: function () {
      if (this.passcode === null) return ''
      if (this.passcode.length > 4) {
        return this.passcode.substring(0, 4) + ' ' + this.passcode.substring(4)
      }
      return this.passcode
    }
  }
}
</script>
<style lang="stylus">
.passcode-text {
  display: block
  height: 100%
  font-size: 1.2em
  font-family: monospace
  text-align: center
  background-color: #bbbbbb
  transition: color 0.4s

  &.hidden {
    color: transparent
    &:hover, &:active {
      color: initial
    }
  }
}
</style>
