<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const dates = ref<string[]>(['2026-06-05', '2026-06-12'])
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="dates"
      selection="multiple"
      label="Dates"
      hint="Click a day to add it, click it again to take it back"
      clearable
    />
    <output class="value" aria-label="Chosen dates">{{ dates.join(', ') || 'none' }}</output>
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
