<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from 'vectis-ui'

const reducedMotion = ref(true)
const notes = ref(true)
</script>

<template>
  <VSwitch v-model="reducedMotion">Respect reduced motion</VSwitch>
  <VSwitch v-model="notes" label-position="start" spread>Send me release notes</VSwitch>
  <VSwitch disabled>Beta channel (unavailable on this plan)</VSwitch>
</template>
