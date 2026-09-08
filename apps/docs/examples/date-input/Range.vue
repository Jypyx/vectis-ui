<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput, type DatePickerRange } from 'vectis-ui'

const period = ref<DatePickerRange>({ start: '2026-06-19', end: '2026-06-26' })
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="period"
      selection="range"
      label="Period"
      hint="Pick the first day, then the last. Typing falls back to read-only here."
      clearable
    />
    <output class="value" aria-label="Chosen period">
      {{ period.start ?? 'none' }} to {{ period.end ?? 'none' }}
    </output>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
