<script setup lang="ts">
import { ref } from 'vue'
import { VCheckbox } from 'vectis-ui'

const off = ref(false)
const on = ref(true)
</script>

<template>
  <div class="stack">
    <VCheckbox v-model="off" disabled>Unticked</VCheckbox>
    <VCheckbox v-model="on" disabled>Ticked</VCheckbox>
    <VCheckbox v-model="off" disabled indeterminate>Partially ticked</VCheckbox>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
