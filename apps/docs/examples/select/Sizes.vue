<script setup lang="ts">
import { VSelect } from 'vectis-ui'

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]

const rows = (['sm', 'md', 'lg'] as const).map((size) => ({ key: size, size, label: size }))
</script>

<template>
  <div class="column">
    <VSelect
      v-for="row in rows"
      :key="row.key"
      :options="countries"
      model-value="fr"
      :size="row.size"
      :label="row.label"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
