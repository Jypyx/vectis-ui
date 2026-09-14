<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from 'vectis-ui'

const wifi = ref(true)
const bluetooth = ref(false)
</script>

<template>
  <div class="stack">
    <VSwitch v-model="wifi" label="Wi-Fi" hint="Joins known networks automatically." />
    <VSwitch v-model="bluetooth" label="Bluetooth" hint="Visible to nearby devices while on." />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
