<template>
  <span class="passcode-text">{{ formatted }}</span>
</template>

<script>
export default {
  name: 'passcode',
  props: ['passcode'],
  computed: {
    formatted: function () {
      if (this.passcode.length > 4) {
        return this.passcode.substring(0, 4) + ' ' + this.passcode.substring(4)
      }
      return this.passcode
    }
  }
}
</script>
