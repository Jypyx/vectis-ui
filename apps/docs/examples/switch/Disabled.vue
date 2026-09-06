<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from 'vectis-ui'

const off = ref(false)
const on = ref(true)
</script>

<template>
  <div class="stack">
    <VSwitch v-model="off" disabled>Off, and cannot be turned on</VSwitch>
    <VSwitch v-model="on" disabled>On, and cannot be turned off</VSwitch>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
