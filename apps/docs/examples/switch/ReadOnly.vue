<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from 'vectis-ui'

const on = ref(true)
const off = ref(false)
</script>

<template>
  <div class="stack">
    <VSwitch v-model="on" readonly label="Managed by your administrator" />
    <VSwitch v-model="off" readonly label="Locked until the next billing period" />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
