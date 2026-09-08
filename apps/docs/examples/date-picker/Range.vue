<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker, type DatePickerRange } from 'vectis-ui'

const period = ref<DatePickerRange>({ start: '2026-06-19', end: '2026-06-26' })
</script>

<template>
  <div class="column">
    <VDatePicker v-model="period" selection="range" />
    <output class="value" aria-label="Chosen period">
      {{ period.start ?? 'none' }} to {{ period.end ?? 'none' }}
    </output>
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
