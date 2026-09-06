<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker } from 'vectis-ui'

const dates = ref<string[]>(['2026-06-05', '2026-06-12', '2026-06-19'])
</script>

<template>
  <div class="column">
    <VDatePicker v-model="dates" selection="multiple" />
    <output class="value" aria-label="Chosen dates">{{ dates.join(', ') || 'none' }}</output>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
