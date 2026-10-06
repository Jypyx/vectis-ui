<script setup lang="ts">
import { VSelect } from 'vectis-ui'

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]

const rows = (['sm', 'md', 'lg'] as const).flatMap((size) => [
  { key: size, size, compact: false, label: size },
  { key: `${size}-compact`, size, compact: true, label: `${size}, compact` },
])
</script>

<template>
  <div class="column">
    <VSelect
      v-for="row in rows"
      :key="row.key"
      :options="countries"
      model-value="fr"
      :size="row.size"
      :compact="row.compact"
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
